import type { Tip, TipState } from '@mergetip/api-client';
import { describe, expect, it } from 'vitest';
import { belongsTo, counterparty, directionFor, totals } from './tips.ts';

function tip(state: TipState, sender: string, receiver: string, amount_sats: number): Tip {
	return {
		id: `${sender}-${receiver}-${state}-${amount_sats}`,
		state,
		amount_sats,
		kind: 'now',
		note: null,
		sender: { login: sender, avatar_url: '' },
		receiver: { login: receiver, avatar_url: '' },
		repo: 'o/r',
		thread_number: 1,
		thread_url: 'https://github.com/o/r/pull/1',
		payment_hash: null,
		created_at: '2026-10-28T00:00:00Z',
		updated_at: '2026-10-28T00:00:00Z',
		expires_at: null
	};
}

describe('totals', () => {
	const tips = [
		tip('paid', 'me', 'alice', 2100),
		tip('paid', 'Me', 'bob', 900),
		tip('paid', 'carol', 'me', 500),
		tip('pledged', 'me', 'dave', 5000),
		tip('held', 'erin', 'me', 1000),
		tip('failed', 'me', 'alice', 7000),
		tip('cancelled', 'me', 'alice', 8000)
	];

	it('sums settled tips each way and in-flight tips either way', () => {
		expect(totals(tips, 'me')).toEqual({ sentSats: 3000, receivedSats: 500, pendingSats: 6000 });
	});

	it('is zero for a new user', () => {
		expect(totals([], 'me')).toEqual({ sentSats: 0, receivedSats: 0, pendingSats: 0 });
	});
});

describe('tabs', () => {
	it('asks the API for everything on the pending tab', () => {
		expect(directionFor('pending')).toBe('all');
		expect(directionFor('sent')).toBe('sent');
	});

	it('keeps only unsettled tips on the pending tab', () => {
		expect(belongsTo('pending', tip('awaiting_confirmation', 'me', 'a', 1))).toBe(true);
		expect(belongsTo('pending', tip('paid', 'me', 'a', 1))).toBe(false);
		expect(belongsTo('sent', tip('paid', 'me', 'a', 1))).toBe(true);
	});
});

describe('counterparty', () => {
	it('shows the receiver of tips I sent and the sender of tips I got', () => {
		expect(counterparty(tip('paid', 'me', 'alice', 1), 'ME')).toMatchObject({
			role: 'to',
			login: 'alice'
		});
		expect(counterparty(tip('paid', 'bob', 'me', 1), 'me')).toMatchObject({
			role: 'from',
			login: 'bob'
		});
	});
});
