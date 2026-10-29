import { describe, expect, it } from 'vitest';
import { isExtensionMessage, isWebMessage } from './bridge';

describe('bridge messages', () => {
	it('accepts the handshake messages', () => {
		expect(isWebMessage({ source: 'mergetip-web', type: 'hello' })).toBe(true);
		expect(
			isWebMessage({
				source: 'mergetip-web',
				type: 'token',
				token: 't',
				expires_at: '2026-11-04T00:00:00Z',
				login: 'alice'
			})
		).toBe(true);
		expect(isExtensionMessage({ source: 'mergetip-extension', type: 'ready', version: '1' })).toBe(
			true
		);
	});

	it.each([
		null,
		'hello',
		{ source: 'someone-else', type: 'hello' },
		{ source: 'mergetip-web', type: 'token', token: 1 },
		{ source: 'mergetip-web', type: 'token', token: 't' },
		{ source: 'mergetip-extension', type: 'hello' }
	])('rejects %j', (value) => {
		expect(isWebMessage(value) && isExtensionMessage(value)).toBe(false);
		expect(isExtensionMessage(value) && value.type === 'ready').toBe(false);
	});
});
