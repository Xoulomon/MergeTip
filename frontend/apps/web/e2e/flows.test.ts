import { expect, test } from '@playwright/test';
import { expectAccessible } from './a11y';
import { error, json, me, mockApi, signedIn, signedOut, tip } from './api';

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const pledge = tip({
	id: 'tip-pledge',
	state: 'pledged',
	amount_sats: 5000,
	sender: { login: 'maintainer', avatar_url: '' },
	receiver: { login: 'newdev', avatar_url: '' },
	payment_hash: null,
	expires_at: inDays(29)
});

test.describe('dashboard', () => {
	test('shows totals, the daily budget and tips with their states', async ({ page }) => {
		const tips = [
			tip({ id: 't1', state: 'paid', amount_sats: 2100 }),
			tip({ id: 't2', state: 'held', amount_sats: 5000, kind: 'on_merge' }),
			tip({
				id: 't3',
				state: 'paid',
				amount_sats: 500,
				sender: { login: 'carol', avatar_url: '' },
				receiver: { login: 'alice', avatar_url: '' }
			}),
			tip({ id: 't4', state: 'awaiting_confirmation', amount_sats: 80_000 })
		];
		await mockApi(page, {
			...signedIn(
				me({
					lightning_address: 'alice@wallet.example',
					wallet: { connected: true, relay: 'wss://r', methods: ['pay_invoice'] }
				})
			),
			'GET /me/tips': async (route) => {
				const direction = new URL(route.request().url()).searchParams.get('direction');
				const items = tips.filter((t) =>
					direction === 'sent'
						? t.sender.login === 'alice'
						: direction === 'received'
							? t.receiver.login === 'alice'
							: true
				);
				await route.fulfill(json({ items, next_cursor: null }));
			}
		});
		await page.goto('/dashboard');

		const totals = page.getByRole('region', { name: 'Totals' });
		await expect(totals).toContainText(/Sent\s*2,100 sats/);
		await expect(totals).toContainText(/Received\s*500 sats/);
		await expect(totals).toContainText(/Pending\s*85,000 sats/);
		await expect(page.getByText('12,000 / 50,000 sats used')).toBeVisible();

		const panel = page.getByRole('tabpanel');
		await expect(panel.getByRole('listitem')).toHaveCount(3);
		await expect(panel).toContainText('Pays on merge');
		await expect(panel.getByRole('link', { name: 'Confirm' })).toHaveAttribute(
			'href',
			'/confirm/t4'
		);
		await expect(panel.getByRole('button', { name: /Copy payment hash/ }).first()).toContainText(
			'a1b2c3…e8f9'
		);

		await page.getByRole('tab', { name: 'Received' }).click();
		await expect(panel.getByRole('listitem')).toHaveCount(1);
		await expect(panel).toContainText('From @carol');

		await page.getByRole('tab', { name: 'Received' }).press('ArrowRight');
		await expect(page.getByRole('tab', { name: 'Pending' })).toBeFocused();
		await expect(panel.getByRole('listitem')).toHaveCount(2);
		await expectAccessible(page);
	});

	test('pages through tips with the cursor', async ({ page }) => {
		const page1 = Array.from({ length: 50 }, (_, i) => tip({ id: `a${i}` }));
		const page2 = [tip({ id: 'last', note: 'the very last one' })];
		await mockApi(page, {
			...signedIn(),
			'GET /me/tips': (route) => {
				const cursor = new URL(route.request().url()).searchParams.get('cursor');
				return route.fulfill(
					json(
						cursor === 'c2'
							? { items: page2, next_cursor: null }
							: { items: page1, next_cursor: 'c2' }
					)
				);
			}
		});
		await page.goto('/dashboard');
		await page.getByRole('tabpanel').getByRole('listitem').last().scrollIntoViewIfNeeded();
		await expect(page.getByText('the very last one')).toBeVisible();
	});

	test('new users get a next step instead of an empty list', async ({ page }) => {
		await mockApi(page, {
			...signedIn(),
			'GET /me/tips': (route) => route.fulfill(json({ items: [], next_cursor: null }))
		});
		await page.goto('/dashboard');
		await expect(page.getByRole('link', { name: 'Connect wallet' })).toBeVisible();
		await expect(page.getByText('No tips sent yet')).toBeVisible();
	});
});

test.describe('claim', () => {
	test.use({ viewport: { width: 360, height: 760 } });

	test('a signed-out receiver is asked to sign in with GitHub', async ({ page }) => {
		await mockApi(page, {
			...signedOut,
			'GET /claims/tok': (route) => route.fulfill(json({ tip: pledge }))
		});
		await page.goto('/claim/tok');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'You have 5,000 sats from @maintainer'
		);
		await expect(page.getByText(/Claim within 2[89]d \d+h/)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in with GitHub to claim' })).toBeVisible();
		await expectAccessible(page);
		// No horizontal scroll at phone width.
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			360
		);
	});

	test('the receiver pastes an address and gets paid', async ({ page }) => {
		let claimed: unknown;
		let state: 'pledged' | 'paying' | 'paid' = 'pledged';
		await mockApi(page, {
			...signedIn(me({ github_login: 'newdev' })),
			'GET /claims/tok': (route) =>
				route.fulfill(
					json({
						tip: { ...pledge, state, payment_hash: state === 'paid' ? 'f'.repeat(64) : null }
					})
				),
			'POST /claims/tok': async (route) => {
				claimed = route.request().postDataJSON();
				state = 'paying';
				await route.fulfill(json({ tip: { ...pledge, state } }));
				setTimeout(() => (state = 'paid'), 500);
			}
		});
		await page.goto('/claim/tok');
		await page.getByLabel('Your Lightning address').fill('newdev@wallet.example');
		await page.getByRole('button', { name: 'Claim sats' }).click();
		await expect(page.getByText('Sending your sats…')).toBeVisible();
		await expect(page.getByRole('heading', { name: '5,000 sats received' })).toBeVisible({
			timeout: 10_000
		});
		expect(claimed).toEqual({ lightning_address: 'newdev@wallet.example' });
	});

	test('someone else signed in is told to switch account', async ({ page }) => {
		await mockApi(page, {
			...signedIn(me({ github_login: 'mallory' })),
			'GET /claims/tok': (route) => route.fulfill(json({ tip: pledge }))
		});
		await page.goto('/claim/tok');
		await expect(page.getByText('This pledge is for @newdev')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Switch account' })).toBeVisible();
	});

	for (const [status, code, heading] of [
		[404, 'claim_not_found', 'This claim link is not valid'],
		[410, 'claim_expired', 'This pledge has expired']
	] as const) {
		test(`shows a clear screen for ${code}`, async ({ page }) => {
			await mockApi(page, {
				...signedOut,
				'GET /claims/tok': (route) => route.fulfill(error(status, code))
			});
			await page.goto('/claim/tok');
			await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
		});
	}

	test('an already-claimed pledge says so', async ({ page }) => {
		await mockApi(page, {
			...signedIn(me({ github_login: 'newdev' })),
			'GET /claims/tok': (route) => route.fulfill(json({ tip: { ...pledge, state: 'paid' } }))
		});
		await page.goto('/claim/tok');
		await expect(page.getByRole('status').filter({ hasText: 'Already claimed' })).toBeVisible();
	});
});

test.describe('confirm a large tip', () => {
	const large = tip({
		id: 'big',
		state: 'awaiting_confirmation',
		amount_sats: 80_000,
		expires_at: inMinutes(59)
	});

	test('with an emailed code', async ({ page }) => {
		let confirmed: unknown;
		const calls = await mockApi(page, {
			...signedIn(me({ confirm_otp_enabled: true })),
			'GET /confirmations/big': (route) => route.fulfill(json({ tip: large })),
			'POST /confirmations/big/otp': (route) => route.fulfill({ status: 204 }),
			'POST /confirmations/big': async (route) => {
				confirmed = route.request().postDataJSON();
				await route.fulfill(
					(confirmed as { otp: string }).otp === '123456'
						? json({ tip: { ...large, state: 'paying' } })
						: error(422, 'otp_invalid')
				);
			}
		});
		await page.goto('/confirm/big');
		await expect(page.getByText('80,000 sats')).toBeVisible();
		await expect(page.getByText(/Confirm within 5\d:\d\d/)).toBeVisible();

		await page.getByRole('button', { name: 'Email me a code' }).click();
		expect(calls).toContain('POST /confirmations/big/otp');

		const code = page.getByLabel('Code from your email');
		await code.fill('Code: 654 321'); // pasted text keeps digits only
		await expect(code).toHaveValue('654321');
		await page.getByRole('button', { name: 'Confirm and send' }).click();
		await expect(page.locator('#otp-error')).toContainText('That code is not right');

		await code.fill('123456');
		await page.getByRole('button', { name: 'Confirm and send' }).click();
		await expect(page.getByText('Your wallet is paying it now.')).toBeVisible();
		expect(confirmed).toEqual({ otp: '123456' });
		await expectAccessible(page);
	});

	test('can be cancelled', async ({ page }) => {
		await mockApi(page, {
			...signedIn(),
			'GET /confirmations/big': (route) => route.fulfill(json({ tip: large })),
			'DELETE /confirmations/big': (route) => route.fulfill({ status: 204 })
		});
		await page.goto('/confirm/big');
		await page.getByRole('button', { name: 'Cancel tip' }).click();
		await expect(page.getByText('Tip cancelled')).toBeVisible();
	});

	test('is disabled once the hour is up', async ({ page }) => {
		await mockApi(page, {
			...signedIn(),
			'GET /confirmations/big': (route) =>
				route.fulfill(
					json({ tip: { ...large, expires_at: new Date(Date.now() - 1000).toISOString() } })
				)
		});
		await page.goto('/confirm/big');
		await expect(page.getByText('The confirmation window has closed')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Confirm and send' })).toBeDisabled();
		await expect(page.getByRole('button', { name: 'Cancel tip' })).toBeDisabled();
	});
});

test('extension connect refuses without the extension installed', async ({ page }) => {
	await mockApi(page, signedIn());
	await page.goto('/extension/connect');
	await expect(page.getByText('Extension not found')).toBeVisible();
});
