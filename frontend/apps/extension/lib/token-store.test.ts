import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { clearToken, readToken, saveToken } from './token-store';

const NOW = Date.parse('2026-10-28T12:00:00Z');
const token = (expires_at: string) => ({ token: 'tok', expires_at, login: 'alice' });

describe('token store', () => {
	beforeEach(() => fakeBrowser.reset());

	it('returns a token until it expires', async () => {
		await saveToken(token('2026-11-04T12:00:00Z'));
		await expect(readToken(NOW)).resolves.toMatchObject({ token: 'tok', login: 'alice' });
	});

	it('forgets an expired token', async () => {
		await saveToken(token('2026-10-28T11:59:59Z'));
		await expect(readToken(NOW)).resolves.toBeNull();
		await expect(readToken(NOW - 60_000)).resolves.toBeNull(); // removed, not just hidden
	});

	it('clears on disconnect', async () => {
		await saveToken(token('2026-11-04T12:00:00Z'));
		await clearToken();
		await expect(readToken(NOW)).resolves.toBeNull();
	});
});
