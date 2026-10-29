// The `/tip` grammar, ported from backend/crates/parser so the landing page previews exactly
// what the bot would do with one line. Keep the two in step.
//
//   /tip @<github-username> <amount>[k] [sats] [on-merge] [for <note>]

export const MAX_AMOUNT_SATS = 100_000_000;
export const MAX_NOTE_CHARS = 140;
const MAX_LOGIN = 39;
const MAX_QUOTE = 40;

export interface TipCommand {
	receiver: string;
	amountSats: number;
	onMerge: boolean;
	note: string | null;
}

export type ParseResult = { ok: true; command: TipCommand } | { ok: false; help: string };

const quote = (token: string) => {
	const chars = [...token];
	const cut = chars.slice(0, MAX_QUOTE).join('').replaceAll('`', "'");
	return chars.length > MAX_QUOTE ? `${cut}…` : cut;
};

const fail = (help: string): ParseResult => ({ ok: false, help });

export function isValidLogin(login: string): boolean {
	return (
		login.length > 0 &&
		login.length <= MAX_LOGIN &&
		/^[a-z\d](?:[a-z\d]|-(?=[a-z\d]))*$/i.test(login)
	);
}

/** `2100` or `2.1k` (×1,000, up to three decimals, the result a whole number of sats). */
export function parseAmount(raw: string): number | 'invalid' | 'out_of_range' {
	const lower = raw.toLowerCase();
	const multiplier = lower.endsWith('k') ? 1_000 : 1;
	const number = multiplier === 1 ? lower : lower.slice(0, -1);
	const [whole = '', fraction = '', ...extra] = number.split('.');
	const hasDot = number.includes('.');
	if (extra.length > 0 || !/^\d+$/.test(whole) || !/^\d*$/.test(fraction)) return 'invalid';
	if (hasDot && (multiplier === 1 || fraction.length === 0 || fraction.length > 3))
		return 'invalid';
	const sats =
		Number(whole) * multiplier +
		(fraction ? Number(fraction) * (multiplier / 10 ** fraction.length) : 0);
	if (!Number.isSafeInteger(sats)) return 'out_of_range';
	return sats === 0 || sats > MAX_AMOUNT_SATS ? 'out_of_range' : sats;
}

/** Parses one line. A line without a `/tip` command is an error, too. */
export function parseTipLine(line: string): ParseResult {
	const match = /(?:^|\s)\/tip(?=\s|$)/i.exec(line);
	if (!match) return fail('Start with `/tip`, e.g. `/tip @alice 2100`.');
	let rest = line.slice(match.index + match[0].length);

	const next = (): string | null => {
		const token = /^\s*(\S+)/.exec(rest);
		if (!token?.[1]) return null;
		rest = rest.slice(token[0].length);
		return token[1];
	};

	const first = next();
	if (!first?.startsWith('@'))
		return fail('Say who to tip, starting with @, e.g. `/tip @alice 2100`.');
	const receiver = first.slice(1);
	if (!isValidLogin(receiver)) {
		return fail(
			`\`${quote(receiver)}\` isn't a valid GitHub username: use letters, digits and single hyphens, up to ${MAX_LOGIN} characters.`
		);
	}

	const rawAmount = next();
	if (!rawAmount) return fail('Add an amount in sats after the username, e.g. `2100` or `2.1k`.');
	const amount = parseAmount(rawAmount);
	if (amount === 'invalid') {
		return fail(
			`\`${quote(rawAmount)}\` isn't an amount: use whole sats like \`2100\`, or \`k\` for thousands like \`2.1k\` (up to 3 decimals).`
		);
	}
	if (amount === 'out_of_range') return fail('Tips must be between 1 sat and 100,000,000 sats.');

	let onMerge = false;
	let seenSats = false;
	let note: string | null = null;
	for (let token = next(); token !== null; token = next()) {
		const lower = token.toLowerCase();
		if ((lower === 'sats' || lower === 'sat') && !seenSats && !onMerge) {
			seenSats = true;
		} else if (lower === 'on-merge' && !onMerge) {
			onMerge = true;
		} else if (lower === 'for') {
			const text = rest.trim();
			if (!text) return fail(unexpected('for'));
			if ([...text].length > MAX_NOTE_CHARS) {
				return fail(`Keep the note after \`for\` to ${MAX_NOTE_CHARS} characters.`);
			}
			note = text;
			break;
		} else {
			return fail(unexpected(quote(token)));
		}
	}
	return { ok: true, command: { receiver, amountSats: amount, onMerge, note } };
}

function unexpected(token: string): string {
	return `\`${token}\` isn't understood here. One receiver per command: put each tip on its own line, and write the note after \`for\`.`;
}
