import type { Me, Tip } from '@mergetip/api-client';
import type { Page, Route } from '@playwright/test';

export const API = 'http://localhost:8080';
const AVATAR = 'https://avatars.githubusercontent.com/u/1?v=4';

export function me(overrides: Partial<Me> = {}): Me {
	return {
		id: 'u-alice',
		github_login: 'alice',
		avatar_url: AVATAR,
		email: 'alice@example.com',
		lightning_address: null,
		wallet: { connected: false, relay: null, methods: [] },
		caps: { per_tip_max_sats: 10_000, daily_max_sats: 50_000, spent_today_sats: 12_000 },
		confirm_threshold_sats: 50_000,
		confirm_otp_enabled: false,
		email_opt_out: false,
		...overrides
	};
}

export function tip(overrides: Partial<Tip> = {}): Tip {
	const now = Date.now();
	return {
		id: 'tip-1',
		state: 'paid',
		amount_sats: 2100,
		kind: 'now',
		note: 'for the review',
		sender: { login: 'alice', avatar_url: AVATAR },
		receiver: { login: 'bob', avatar_url: AVATAR },
		repo: 'acme/widgets',
		thread_number: 42,
		thread_url: 'https://github.com/acme/widgets/pull/42',
		payment_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f9',
		created_at: new Date(now - 3_600_000).toISOString(),
		updated_at: new Date(now - 3_600_000).toISOString(),
		expires_at: null,
		...overrides
	};
}

export const error = (status: number, code: string) => ({
	status,
	contentType: 'application/json',
	body: JSON.stringify({ error: { code, message: `${code} (test)` } })
});

export const json = (body: unknown, status = 200) => ({
	status,
	contentType: 'application/json',
	body: JSON.stringify(body)
});

type Handler = (route: Route) => Promise<void> | void;

/**
 * Routes every call to the API through `handlers`, keyed by `METHOD /path` (path without `/v1`
 * and query string). Unhandled calls fail the test loudly with a 599.
 */
export async function mockApi(page: Page, handlers: Record<string, Handler>): Promise<string[]> {
	const calls: string[] = [];
	await page.route(`${API}/**`, async (route) => {
		const url = new URL(route.request().url());
		const key = `${route.request().method()} ${url.pathname.replace(/^\/v1/, '')}`;
		calls.push(key);
		const handler = handlers[key];
		if (handler) return handler(route);
		return route.fulfill({ status: 599, body: `unmocked ${key}` });
	});
	// GitHub avatars are cosmetic; keep tests offline.
	await page.route('https://avatars.githubusercontent.com/**', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'image/svg+xml',
			body: '<svg xmlns="http://www.w3.org/2000/svg"/>'
		})
	);
	return calls;
}

export const signedIn = (profile: Me = me()) => ({
	'GET /me': (route: Route) => route.fulfill(json(profile))
});

export const signedOut = {
	'GET /me': (route: Route) => route.fulfill(error(401, 'unauthenticated'))
};
