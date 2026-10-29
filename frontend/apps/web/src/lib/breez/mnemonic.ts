import { generateMnemonic, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

/** A new 12-word BIP-39 recovery phrase (128 bits of entropy from `crypto.getRandomValues`). */
export function newMnemonic(): string[] {
	return generateMnemonic(wordlist, 128).split(' ');
}

export function isValidMnemonic(words: readonly string[]): boolean {
	return validateMnemonic(words.join(' '), wordlist);
}

/** Picks `count` distinct word positions (0-based, ascending) for the backup check. */
export function pickChallenge(
	length: number,
	count = 3,
	random: () => number = secureRandom
): number[] {
	const positions = Array.from({ length }, (_, index) => index);
	for (let i = positions.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[positions[i], positions[j]] = [positions[j] as number, positions[i] as number];
	}
	return positions.slice(0, count).sort((a, b) => a - b);
}

/** True when every challenged word was typed back correctly (case and spaces ignored). */
export function passesChallenge(
	words: readonly string[],
	answers: Readonly<Record<number, string>>,
	positions: readonly number[]
): boolean {
	return positions.every(
		(position) => (answers[position] ?? '').trim().toLowerCase() === words[position]
	);
}

function secureRandom(): number {
	const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
	return value / 2 ** 32;
}
