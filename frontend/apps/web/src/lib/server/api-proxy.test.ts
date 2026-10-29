import { describe, expect, it, vi } from 'vitest';
import { CLIENT_IP_HEADER, forward } from './api-proxy.ts';

const API = 'https://api.example';

function upstreamWith(response: Response) {
	return vi.fn<typeof fetch>(() => Promise.resolve(response));
}

describe('forward', () => {
	it('sends the same path and query to the API, with the caller IP it trusts', async () => {
		const fetch = upstreamWith(Response.json({ ok: true }));
		const request = new Request('https://web.example/v1/me/tips?direction=sent', {
			headers: { cookie: 'mt_session=abc', [CLIENT_IP_HEADER]: '6.6.6.6', connection: 'keep-alive' }
		});
		const response = await forward(request, { apiOrigin: API, clientIp: '203.0.113.7', fetch });

		expect(response.status).toBe(200);
		const [url, init] = fetch.mock.calls[0] ?? [];
		expect(String(url)).toBe('https://api.example/v1/me/tips?direction=sent');
		const headers = new Headers(init?.headers);
		expect(headers.get('cookie')).toBe('mt_session=abc');
		// A value the caller sent is replaced, never trusted.
		expect(headers.get(CLIENT_IP_HEADER)).toBe('203.0.113.7');
		expect(headers.has('connection')).toBe(false);
		expect(init?.redirect).toBe('manual');
	});

	it('forwards bodies and passes redirects and every cookie back untouched', async () => {
		const answer = new Response(null, {
			status: 303,
			headers: [
				['location', 'https://github.com/login/oauth/authorize?state=x'],
				['set-cookie', 'mt_oauth=1; Path=/; HttpOnly'],
				['set-cookie', 'mt_session=2; Path=/; HttpOnly']
			]
		});
		const fetch = upstreamWith(answer);
		const request = new Request('https://web.example/v1/me/wallet', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ nwc_uri: 'x' })
		});
		const response = await forward(request, { apiOrigin: API, clientIp: '1.2.3.4', fetch });

		const init = fetch.mock.calls[0]?.[1];
		expect(init?.method).toBe('PUT');
		expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe('{"nwc_uri":"x"}');
		expect(response.status).toBe(303);
		expect(response.headers.get('location')).toContain('github.com/login/oauth');
		expect(response.headers.getSetCookie()).toEqual([
			'mt_oauth=1; Path=/; HttpOnly',
			'mt_session=2; Path=/; HttpOnly'
		]);
	});

	it('answers 502 in the API error format when the API is unreachable', async () => {
		const unreachable = vi.fn<typeof globalThis.fetch>(() =>
			Promise.reject(new TypeError('fetch failed'))
		);
		const response = await forward(new Request('https://web.example/healthz'), {
			apiOrigin: API,
			clientIp: '1.2.3.4',
			fetch: unreachable
		});
		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({
			error: { code: 'service_unavailable', message: 'The API is unavailable.' }
		});
	});
});
