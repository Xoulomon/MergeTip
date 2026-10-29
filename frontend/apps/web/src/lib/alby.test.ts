import { describe, expect, it } from 'vitest';
import { albyConnectUrl } from './alby.ts';

describe('albyConnectUrl', () => {
	it('asks for pay_invoice only, with a budget in millisats', () => {
		const url = new URL(
			albyConnectUrl({ hubUrl: 'https://my.albyhub.com', budgetSats: 50_000, renewal: 'monthly' })
		);
		expect(url.origin + url.pathname).toBe('https://my.albyhub.com/apps/new');
		expect(Object.fromEntries(url.searchParams)).toEqual({
			name: 'MergeTip',
			request_methods: 'pay_invoice',
			max_amount: '50000000',
			budget_renewal: 'monthly'
		});
	});

	it('never asks the hub to hand back keys', () => {
		const url = new URL(
			albyConnectUrl({ hubUrl: 'https://hub.example', budgetSats: 1, renewal: 'never' })
		);
		expect(url.searchParams.has('pubkey')).toBe(false);
		expect(url.searchParams.has('return_to')).toBe(false);
	});
});
