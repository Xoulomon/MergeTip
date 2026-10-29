import { describe, expect, it } from 'vitest';
import {
	formatCountdown,
	formatRelativeTime,
	formatSats,
	stateLabel,
	stateTone,
	truncateMiddle,
	type TipStateName
} from './format';

describe('formatSats', () => {
	it.each([
		[0, '0 sats'],
		[1, '1 sat'],
		[21, '21 sats'],
		[2100, '2,100 sats'],
		[100_000_000, '100,000,000 sats']
	])('%d → %s', (amount, expected) => expect(formatSats(amount)).toBe(expected));
});

describe('state labels', () => {
	it.each<[TipStateName, string]>([
		['paid', 'Paid'],
		['pledged', 'Waiting for claim'],
		['held', 'Pays on merge'],
		['awaiting_confirmation', 'Needs your confirmation'],
		['awaiting_sender', 'Waiting for wallet'],
		['paying', 'Processing'],
		['verifying', 'Processing'],
		['received', 'Processing'],
		['failed', 'Failed'],
		['expired', 'Expired']
	])('%s → %s', (state, label) => expect(stateLabel(state)).toBe(label));

	it('uses status colours for good, warning and critical states', () => {
		expect(stateTone('paid')).toBe('success');
		expect(stateTone('awaiting_confirmation')).toBe('warning');
		expect(stateTone('failed')).toBe('danger');
	});
});

describe('formatRelativeTime', () => {
	const now = Date.parse('2026-10-28T12:00:00Z');

	it.each([
		['2026-10-28T11:59:40Z', 'just now'],
		['2026-10-28T11:55:00Z', '5 minutes ago'],
		['2026-10-28T09:00:00Z', '3 hours ago'],
		['2026-10-27T12:00:00Z', 'yesterday'],
		['2026-10-29T12:00:00Z', 'tomorrow']
	])('%s → %s', (date, expected) => expect(formatRelativeTime(date, now)).toBe(expected));
});

describe('formatCountdown', () => {
	it.each([
		[-5_000, '0:00'],
		[59_000, '0:59'],
		[3_599_000, '59:59'],
		[3_600_000, '1:00:00'],
		[29 * 86_400_000 + 5 * 3_600_000, '29d 5h']
	])('%d ms → %s', (ms, expected) => expect(formatCountdown(ms)).toBe(expected));
});

describe('truncateMiddle', () => {
	it('keeps short values', () => expect(truncateMiddle('abcdef')).toBe('abcdef'));
	it('shortens long hashes', () =>
		expect(truncateMiddle('a1b2c3d4e5f6a7b8c9d0')).toBe('a1b2c3…c9d0'));
});
