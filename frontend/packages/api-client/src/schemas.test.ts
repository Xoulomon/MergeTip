import { describe, expect, it } from 'vitest';
import { firstIssue, githubLogin, lightningAddress, limits, nwcUri, otp } from './schemas';

const PUBKEY = 'b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4';

describe('nwcUri', () => {
	it('accepts a NIP-47 connection string', () => {
		const uri = `nostr+walletconnect://${PUBKEY}?relay=wss%3A%2F%2Frelay.getalby.com&secret=abc`;
		expect(firstIssue(nwcUri, uri)).toBeNull();
	});

	it.each([
		['', 'Paste'],
		['https://example.com', 'does not look like'],
		[`nostr+walletconnect://${PUBKEY}?secret=abc`, 'does not look like'],
		['nostr+walletconnect://nothex?relay=wss://r&secret=x', 'does not look like']
	])('rejects %j', (value, message) => {
		expect(firstIssue(nwcUri, value)).toContain(message);
	});
});

describe('lightningAddress', () => {
	it.each(['alice@getalby.com', 'Alice@Wallet.Of.Satoshi.com', '254712345678@bitcoin.co.ke'])(
		'accepts %s',
		(value) => expect(firstIssue(lightningAddress, value)).toBeNull()
	);

	it('normalises case and whitespace', () => {
		expect(lightningAddress.parse('  Bob@Example.COM ')).toBe('bob@example.com');
	});

	it.each(['alice', 'alice@', '@getalby.com', 'a b@c.com'])('rejects %j', (value) => {
		expect(firstIssue(lightningAddress, value)).not.toBeNull();
	});
});

describe('githubLogin', () => {
	it('strips a leading @', () => {
		expect(githubLogin.parse('@octo-cat')).toBe('octo-cat');
	});

	it.each(['-bad', 'bad-', 'no--double', 'x'.repeat(40), 'has space'])('rejects %j', (value) => {
		expect(firstIssue(githubLogin, value)).not.toBeNull();
	});
});

describe('limits', () => {
	const valid = { per_tip_max_sats: 5_000, daily_max_sats: 50_000, confirm_threshold_sats: 50_000 };

	it('accepts sensible limits', () => {
		expect(firstIssue(limits, valid)).toBeNull();
	});

	it('enforces the 1,000-sat confirmation floor (FR-12.1)', () => {
		expect(firstIssue(limits, { ...valid, confirm_threshold_sats: 999 })).toContain('1,000');
	});

	it('keeps the per-tip limit under the daily limit', () => {
		expect(firstIssue(limits, { ...valid, per_tip_max_sats: 60_000 })).toContain('daily');
	});

	it('rejects fractional sats', () => {
		expect(firstIssue(limits, { ...valid, daily_max_sats: 10.5 })).toContain('whole');
	});
});

describe('otp', () => {
	it('accepts six digits, trimming pasted whitespace', () => {
		expect(otp.parse(' 123456 ')).toBe('123456');
	});

	it.each(['12345', '1234567', '12345a'])('rejects %j', (value) => {
		expect(firstIssue(otp, value)).not.toBeNull();
	});
});
