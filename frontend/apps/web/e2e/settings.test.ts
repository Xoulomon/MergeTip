import { expect, test } from '@playwright/test';
import { expectAccessible } from './a11y';
import { error, json, me, mockApi, signedIn } from './api';

const NWC =
	'nostr+walletconnect://b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4?relay=wss%3A%2F%2Frelay.example&secret=00';

test('connect wallet: invalid strings never leave the browser', async ({ page }) => {
	const calls = await mockApi(page, signedIn());
	await page.goto('/settings/wallet');
	await page.getByLabel('Wallet connection string').fill('https://not-a-wallet');
	await page.getByRole('button', { name: 'Connect wallet' }).click();
	await expect(page.getByText('does not look like a wallet connection string')).toBeVisible();
	expect(calls).not.toContain('PUT /me/wallet');
	await expectAccessible(page);
});

for (const code of ['nwc_invalid_uri', 'nwc_unreachable', 'nwc_missing_pay_invoice']) {
	test(`connect wallet: shows ${code} beside the field`, async ({ page }) => {
		await mockApi(page, {
			...signedIn(),
			'PUT /me/wallet': (route) => route.fulfill(error(422, code))
		});
		await page.goto('/settings/wallet');
		const field = page.getByLabel('Wallet connection string');
		await field.fill(NWC);
		await page.getByRole('button', { name: 'Connect wallet' }).click();
		await expect(field).toHaveAttribute('aria-invalid', 'true');
		await expect(page.locator('#nwc-uri-error')).not.toContainText(code);
		// The secret is cleared from the page once sent.
		await expect(field).toHaveValue('');
	});
}

test('connect wallet: success shows the connection, then disconnects', async ({ page }) => {
	const connected = me({
		wallet: { connected: true, relay: 'wss://relay.example', methods: ['pay_invoice'] }
	});
	let profile = me();
	let sent: unknown;
	await mockApi(page, {
		'GET /me': (route) => route.fulfill(json(profile)),
		'PUT /me/wallet': async (route) => {
			sent = route.request().postDataJSON();
			profile = connected;
			await route.fulfill(json(connected));
		},
		'DELETE /me/wallet': async (route) => {
			profile = me();
			await route.fulfill({ status: 204 });
		}
	});
	await page.goto('/settings/wallet');
	await page.getByLabel('Wallet connection string').fill(NWC);
	await page.getByRole('button', { name: 'Connect wallet' }).click();
	await expect(page.getByText('wss://relay.example')).toBeVisible();
	expect(sent).toEqual({ nwc_uri: NWC });

	await page.getByRole('button', { name: 'Disconnect wallet' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Disconnect' }).click();
	await expect(page.getByLabel('Wallet connection string')).toBeVisible();
});

test('connect with Alby asks for pay_invoice only, within the chosen budget', async ({ page }) => {
	await mockApi(page, signedIn());
	await page.goto('/settings/wallet');
	await page.getByLabel('Budget (sats)').fill('21000');
	await page.getByLabel('Budget renews').selectOption('weekly');
	const href = await page.getByRole('link', { name: 'Connect with Alby' }).getAttribute('href');
	const url = new URL(href ?? '');
	expect(url.searchParams.get('request_methods')).toBe('pay_invoice');
	expect(url.searchParams.get('max_amount')).toBe('21000000');
	expect(url.searchParams.get('budget_renewal')).toBe('weekly');
});

test('receive settings: errors appear inline and a good address is saved', async ({ page }) => {
	await mockApi(page, {
		...signedIn(),
		'PUT /me/lightning-address': async (route) => {
			const { address } = route.request().postDataJSON() as { address: string };
			await route.fulfill(
				address.startsWith('down')
					? error(422, 'lnurl_unreachable')
					: json(me({ lightning_address: address }))
			);
		}
	});
	await page.goto('/settings/receive');
	const field = page.getByLabel('Lightning address');
	await field.fill('down@wallet.example');
	await page.getByRole('button', { name: 'Save address' }).click();
	await expect(page.locator('#lightning-address-error')).toHaveText(
		'We could not reach that Lightning address. Check the spelling and try again.'
	);
	await field.fill('Alice@Wallet.Example');
	await page.getByRole('button', { name: 'Save address' }).click();
	await expect(page.getByText('Paid instantly')).toBeVisible();
	await expectAccessible(page);
});

test('limits: values persist, and loosening asks for a fresh sign-in', async ({ page }) => {
	const bodies: unknown[] = [];
	await mockApi(page, {
		...signedIn(),
		'PATCH /me/settings': async (route) => {
			const body = route.request().postDataJSON() as { per_tip_max_sats?: number };
			bodies.push(body);
			await route.fulfill(
				(body.per_tip_max_sats ?? 0) > 10_000
					? error(403, 'reauth_required')
					: json(
							me({ caps: { per_tip_max_sats: 5_000, daily_max_sats: 50_000, spent_today_sats: 0 } })
						)
			);
		}
	});
	await page.goto('/settings/limits');

	await page.getByLabel('Confirm tips above').fill('999');
	await page.getByRole('button', { name: 'Save limits' }).click();
	await expect(page.locator('#confirm_threshold_sats-error')).toHaveText(
		'The confirmation threshold must be at least 1,000 sats.'
	);
	expect(bodies).toEqual([]);

	await page.getByLabel('Confirm tips above').fill('50000');
	await page.getByLabel('Most per tip').fill('5000');
	await page.getByRole('button', { name: 'Save limits' }).click();
	await expect(page.getByText('Limits saved.')).toBeVisible();
	expect(bodies.at(-1)).toEqual({ per_tip_max_sats: 5000 });

	await page.getByLabel('Most per tip').fill('20000');
	await page.getByRole('button', { name: 'Save limits' }).click();
	await expect(page.getByRole('button', { name: 'Sign in again' })).toBeVisible();
	await expectAccessible(page);
});

test('account deletion requires typing the GitHub login', async ({ page }) => {
	const calls = await mockApi(page, {
		...signedIn(),
		'DELETE /me': (route) => route.fulfill({ status: 204 })
	});
	await page.goto('/settings/account');
	await page.getByRole('button', { name: 'Delete my account' }).click();
	const dialog = page.getByRole('dialog');
	const confirm = dialog.getByRole('button', { name: 'Delete account' });
	await expect(confirm).toBeDisabled();
	await dialog.getByLabel('Type alice to confirm').fill('alicex');
	await expect(confirm).toBeDisabled();
	await dialog.getByLabel('Type alice to confirm').fill('Alice');
	await confirm.click();
	await page.waitForURL('/');
	expect(calls).toContain('DELETE /me');
});

test('create a wallet: backup words, check three of them, then choose a PIN', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await mockApi(page, signedIn());
	await page.goto('/settings/receive');
	await page.getByRole('button', { name: 'Create a wallet in this browser' }).click();

	const words = await page
		.getByRole('list', { name: 'Recovery phrase' })
		.locator('li span:last-child')
		.allTextContents();
	expect(words).toHaveLength(12);
	const next = page.getByRole('button', { name: 'Continue' });
	await expect(next).toBeDisabled();
	await page.getByLabel('I have written down all 12 words').check();
	await next.click();

	const fields = page.getByLabel(/^Word #\d+$/);
	await expect(fields).toHaveCount(3);
	const positions = await Promise.all(
		(await fields.all()).map(async (field) =>
			Number((await field.getAttribute('id'))?.split('-').pop())
		)
	);
	await fields.first().fill('wrong');
	await page.getByRole('button', { name: 'Check words' }).click();
	await expect(page.getByText('One or more words do not match')).toBeVisible();

	for (const [index, position] of positions.entries()) {
		await fields.nth(index).fill(words[position] ?? '');
	}
	await page.getByRole('button', { name: 'Check words' }).click();
	await expect(page.getByLabel('Repeat PIN')).toBeVisible();
	expect(errors).toEqual([]);
	await expectAccessible(page);
});
