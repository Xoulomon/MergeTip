import { expect, test } from '@playwright/test';
import { expectAccessible } from './a11y';
import { API, mockApi, signedIn, signedOut } from './api';

test('landing pitches the product and previews the bot', async ({ page }) => {
	await mockApi(page, signedOut);
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Tip open-source contributors in sats, straight from GitHub.'
	);
	await expect(page.getByRole('link', { name: 'Install GitHub App' }).first()).toHaveAttribute(
		'href',
		/github\.com\/apps\/.+\/installations\/new/
	);
	await expect(page.getByRole('button', { name: 'Sign in with GitHub' })).toBeVisible();

	const playground = page.getByLabel('Try the command');
	await playground.fill('/tip @newdev 5k on-merge');
	await expect(page.locator('#playground-result')).toContainText(
		'will tip @newdev 5,000 sats when this PR is merged'
	);
	await playground.fill('/tip @alice 500 @bob 500');
	await expect(page.locator('#playground-result')).toContainText('One receiver per command');

	await expectAccessible(page);
});

test('signed-out visitors to a protected page are sent to GitHub sign-in, then back', async ({
	page
}) => {
	await mockApi(page, {
		...signedOut,
		'GET /auth/github/login': (route) => route.fulfill({ status: 200, body: 'github sign-in' })
	});
	await page.goto('/settings/limits?from=email');
	await page.waitForURL(`${API}/v1/auth/github/login**`);
	expect(new URL(page.url()).searchParams.get('redirect')).toBe('/settings/limits?from=email');
});

test('signed-in users see their account in the header and can sign out', async ({ page }) => {
	const calls = await mockApi(page, {
		...signedIn(),
		'POST /auth/logout': (route) => route.fulfill({ status: 204 })
	});
	await page.goto('/');
	await expect(page.getByRole('banner').getByText('@alice')).toBeVisible();
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
	expect(calls).toContain('POST /auth/logout');
});

test('the theme toggle switches and remembers the theme', async ({ page }) => {
	await mockApi(page, signedOut);
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	await page.getByRole('button', { name: 'Switch to dark theme' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('the CSP lets the in-browser wallet reach Breez, including non-default ports', async ({
	request
}) => {
	const response = await request.get('/settings/receive');
	const csp = response.headers()['content-security-policy'] ?? '';
	const connect = csp.split(';').find((d) => d.trim().startsWith('connect-src')) ?? '';
	for (const source of [
		'https://*.breez.technology:*',
		'wss://*.breez.technology:*',
		'https://breez.tips'
	]) {
		expect(connect).toContain(source);
	}
	expect(csp).toContain("'wasm-unsafe-eval'");
});
