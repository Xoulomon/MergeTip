import { describe, expect, it, vi } from 'vitest';
import { MergeTipApi } from './client';
import { ApiError, messageFor } from './errors';

const ME = {
	id: 'u1',
	github_login: 'alice',
	avatar_url: 'https://avatars.githubusercontent.com/u/1',
	email: null,
	lightning_address: null,
	wallet: { connected: false, relay: null, methods: [] },
	caps: { per_tip_max_sats: 10_000, daily_max_sats: 50_000, spent_today_sats: 0 },
	confirm_threshold_sats: 50_000,
	confirm_otp_enabled: false,
	email_opt_out: false
};

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function apiWith(handler: (request: Request) => Response | Promise<Response>, extra = {}) {
	const fetch = vi.fn((input: RequestInfo | URL) => Promise.resolve(handler(input as Request)));
	return { api: new MergeTipApi({ baseUrl: 'http://api.test/', fetch, ...extra }), fetch };
}

describe('MergeTipApi', () => {
	it('returns the body of a successful call', async () => {
		const { api, fetch } = apiWith(() => json(200, ME));
		await expect(api.me()).resolves.toEqual(ME);
		const request = fetch.mock.calls[0]?.[0] as Request;
		expect(request.url).toBe('http://api.test/v1/me');
		expect(request.credentials).toBe('include');
	});

	it('maps the error envelope to an ApiError with human copy', async () => {
		const { api } = apiWith(() =>
			json(422, { error: { code: 'lnurl_unreachable', message: 'dns failed' } })
		);
		const error = await api.setLightningAddress('a@b.c').catch((e: unknown) => e);
		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			status: 422,
			code: 'lnurl_unreachable',
			detail: 'dns failed',
			message: messageFor('lnurl_unreachable')
		});
	});

	it('recognises a signed-out session', async () => {
		const { api } = apiWith(() =>
			json(401, { error: { code: 'unauthenticated', message: 'Sign in to continue.' } })
		);
		const error = (await api.me().catch((e: unknown) => e)) as ApiError;
		expect(error.isUnauthenticated).toBe(true);
	});

	it('falls back to a status-based code when the body is not an envelope', async () => {
		const { api } = apiWith(() => new Response('bad gateway', { status: 502 }));
		await expect(api.me()).rejects.toMatchObject({ status: 502, code: 'internal' });
	});

	it('turns a transport failure into a retryable network error', async () => {
		const { api } = apiWith(() => {
			throw new TypeError('Failed to fetch');
		});
		const error = (await api.me().catch((e: unknown) => e)) as ApiError;
		expect(error.code).toBe('network_error');
		expect(error.isNetwork).toBe(true);
	});

	it('gives up after the timeout', async () => {
		const { api } = apiWith(
			(request) =>
				new Promise((_, reject) => {
					request.signal.addEventListener('abort', () => reject(request.signal.reason));
				}),
			{ timeoutMs: 20 }
		);
		await expect(api.me()).rejects.toMatchObject({ code: 'timeout', status: 0 });
	});

	it('handles empty 204 responses', async () => {
		const { api, fetch } = apiWith(() => new Response(null, { status: 204 }));
		await expect(api.disconnectWallet()).resolves.toBeUndefined();
		expect((fetch.mock.calls[0]?.[0] as Request).method).toBe('DELETE');
	});

	it('sends the bearer token when one is configured', async () => {
		const { api, fetch } = apiWith(() => json(200, { login: 'bob', method: 'none' }), {
			getToken: () => 'tok_123'
		});
		await api.receiveStatus('bob');
		const request = fetch.mock.calls[0]?.[0] as Request;
		expect(request.headers.get('Authorization')).toBe('Bearer tok_123');
		expect(request.url).toBe('http://api.test/v1/users/bob/receive-status');
	});

	it('unwraps tip envelopes and omits an empty claim address', async () => {
		const tip = { id: 't1', state: 'paid' };
		const { api, fetch } = apiWith(() => json(200, { tip }));
		await expect(api.submitClaim('tok')).resolves.toEqual(tip);
		await expect((fetch.mock.calls[0]?.[0] as Request).json()).resolves.toEqual({});
	});

	it('builds a login URL that carries the return path', () => {
		const { api } = apiWith(() => json(200, {}));
		expect(api.loginUrl('/claim/abc?x=1')).toBe(
			'http://api.test/v1/auth/github/login?redirect=%2Fclaim%2Fabc%3Fx%3D1'
		);
	});

	it('serialises tip list filters', async () => {
		const { api, fetch } = apiWith(() => json(200, { items: [], next_cursor: null }));
		await api.tips({ direction: 'sent', cursor: 'c2' });
		expect((fetch.mock.calls[0]?.[0] as Request).url).toBe(
			'http://api.test/v1/me/tips?direction=sent&cursor=c2'
		);
	});
});

describe('messageFor', () => {
	it('never exposes an unknown code', () => {
		expect(messageFor('some_new_code')).not.toContain('some_new_code');
	});
});
