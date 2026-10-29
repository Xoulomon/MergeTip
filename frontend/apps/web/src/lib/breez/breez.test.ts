import { describe, expect, it } from 'vitest';
import { isValidMnemonic, newMnemonic, passesChallenge, pickChallenge } from './mnemonic.ts';
import { open, seal } from './vault.ts';

describe('mnemonic', () => {
	it('generates a valid 12-word phrase, different every time', () => {
		const words = newMnemonic();
		expect(words).toHaveLength(12);
		expect(isValidMnemonic(words)).toBe(true);
		expect(newMnemonic()).not.toEqual(words);
	});

	it('picks distinct, sorted positions to check', () => {
		const positions = pickChallenge(12, 3);
		expect(new Set(positions).size).toBe(3);
		expect(positions).toEqual([...positions].sort((a, b) => a - b));
		expect(positions.every((p) => p >= 0 && p < 12)).toBe(true);
	});

	it('accepts the right words, ignoring case and spaces', () => {
		const words = ['alpha', 'bravo', 'charlie', 'delta'];
		expect(passesChallenge(words, { 1: ' Bravo ', 3: 'delta' }, [1, 3])).toBe(true);
		expect(passesChallenge(words, { 1: 'bravo', 3: 'echo' }, [1, 3])).toBe(false);
		expect(passesChallenge(words, { 1: 'bravo' }, [1, 3])).toBe(false);
	});
});

describe('vault', () => {
	const phrase = 'legal winner thank year wave sausage worth useful legal winner thank yellow';

	it('round-trips the phrase with the right PIN', async () => {
		const sealed = await seal(phrase, '123456');
		expect(new TextDecoder().decode(sealed.ciphertext)).not.toContain('legal');
		await expect(open(sealed, '123456')).resolves.toBe(phrase);
	});

	it('refuses a wrong PIN', async () => {
		const sealed = await seal(phrase, '123456');
		await expect(open(sealed, '654321')).rejects.toThrow();
	});

	it('refuses short PINs', async () => {
		await expect(seal(phrase, '123')).rejects.toThrow('at least 6');
	});
});
