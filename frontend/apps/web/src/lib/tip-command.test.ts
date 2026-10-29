import { describe, expect, it } from 'vitest';
import { parseAmount, parseTipLine } from './tip-command';

// Cases from the PRD's grammar table and backend/crates/parser's tests.
describe('parseTipLine', () => {
	it.each([
		['/tip @alice 2100', { receiver: 'alice', amountSats: 2100, onMerge: false, note: null }],
		[
			'/tip @alice 2.1k for the review',
			{ receiver: 'alice', amountSats: 2100, onMerge: false, note: 'the review' }
		],
		['/tip @bob 5000 on-merge', { receiver: 'bob', amountSats: 5000, onMerge: true, note: null }],
		[
			'/TIP @bob 5k sats on-merge',
			{ receiver: 'bob', amountSats: 5000, onMerge: true, note: null }
		],
		[
			'thanks! /tip @octo-cat 21 sats for `fix` on-merge',
			{ receiver: 'octo-cat', amountSats: 21, onMerge: false, note: '`fix` on-merge' }
		]
	])('parses %j', (line, command) => {
		expect(parseTipLine(line)).toEqual({ ok: true, command });
	});

	it('rejects two receivers in one command, as the PRD requires', () => {
		const result = parseTipLine('/tip @alice 500 @bob 500');
		expect(result.ok).toBe(false);
		expect(!result.ok && result.help).toContain('One receiver per command');
	});

	it.each([
		['/tip', 'Say who to tip'],
		['/tip alice 100', 'Say who to tip'],
		['/tip @-bad 100', "isn't a valid GitHub username"],
		['/tip @alice', 'Add an amount'],
		['/tip @alice lots', "isn't an amount"],
		['/tip @alice 0', 'between 1 sat'],
		['/tip @alice 100000001', 'between 1 sat'],
		['/tip @alice 10 for', "isn't understood"],
		[`/tip @alice 10 for ${'x'.repeat(141)}`, '140 characters'],
		['/tip @alice 10 on-merge on-merge', "isn't understood"],
		['/tipping @alice 10', 'Start with `/tip`'],
		['hello', 'Start with `/tip`']
	])('explains what is wrong with %j', (line, help) => {
		const result = parseTipLine(line);
		expect(result.ok).toBe(false);
		expect(!result.ok && result.help).toContain(help);
	});
});

describe('parseAmount', () => {
	it.each([
		['2100', 2100],
		['2.1k', 2100],
		['2.125K', 2125],
		['1k', 1000],
		['21', 21]
	])('%s → %d', (raw, sats) => expect(parseAmount(raw)).toBe(sats));

	it.each(['2.1', '2.1234k', 'k', '.5k', '1.k', '-1', '1e3', '1.2.3k'])('rejects %s', (raw) => {
		expect(parseAmount(raw)).toBe('invalid');
	});
});
