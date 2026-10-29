// Client-side validation for everything people type before it is sent. The limits mirror the
// backend's (crates/parser and crates/api/src/routes), so most mistakes are caught before a
// round trip; the API still has the final say.
import { z } from 'zod';

export const MAX_TIP_SATS = 100_000_000;
export const MAX_NOTE_CHARS = 140;
export const MIN_CONFIRM_THRESHOLD_SATS = 1_000;
export const OTP_LENGTH = 6;

/** GitHub's login rules: alphanumerics and single hyphens, not at either end, 1–39 characters. */
export const githubLogin = z
	.string()
	.trim()
	.transform((value) => value.replace(/^@/, ''))
	.pipe(
		z
			.string()
			.min(1, 'Enter a GitHub username.')
			.max(39, 'GitHub usernames are at most 39 characters.')
			.regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d]))*$/i, 'Use letters, digits and single hyphens.')
	);

/** A NIP-47 connection string. Only the shape is checked here; the API connects to the wallet. */
export const nwcUri = z
	.string()
	.trim()
	.min(1, 'Paste your wallet connection string.')
	.refine((value) => {
		if (!value.startsWith('nostr+walletconnect://')) return false;
		try {
			const url = new URL(value);
			return (
				/^[0-9a-f]{64}$/i.test(url.hostname || url.pathname.replace(/^\/+/, '')) &&
				url.searchParams.has('relay') &&
				url.searchParams.has('secret')
			);
		} catch {
			return false;
		}
	}, 'This does not look like a wallet connection string. It starts with nostr+walletconnect:// and includes a relay and a secret.');

/** A LUD-16 Lightning address, `name@domain`. */
export const lightningAddress = z
	.string()
	.trim()
	.toLowerCase()
	.min(1, 'Enter a Lightning address.')
	.max(320, 'That address is too long.')
	.regex(
		/^[a-z0-9._+-]+@(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/,
		'A Lightning address looks like name@wallet.com.'
	);

const sats = (label: string) =>
	z
		.number({ error: `${label} must be a number.` })
		.int(`${label} must be a whole number of sats.`)
		.min(1, `${label} must be at least 1 sat.`)
		.max(MAX_TIP_SATS, `${label} can be at most 100,000,000 sats.`);

export const limits = z
	.object({
		per_tip_max_sats: sats('The per-tip limit'),
		daily_max_sats: sats('The daily limit'),
		confirm_threshold_sats: sats('The confirmation threshold').min(
			MIN_CONFIRM_THRESHOLD_SATS,
			'The confirmation threshold must be at least 1,000 sats.'
		)
	})
	.refine((value) => value.per_tip_max_sats <= value.daily_max_sats, {
		path: ['per_tip_max_sats'],
		message: 'The per-tip limit cannot be higher than the daily limit.'
	});
export type Limits = z.infer<typeof limits>;

export const otp = z
	.string()
	.trim()
	.regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code from your email.`);

export const note = z
	.string()
	.trim()
	.max(MAX_NOTE_CHARS, `Keep the note to ${MAX_NOTE_CHARS} characters.`);

export const tipComment = z.object({
	repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'Unknown repository.'),
	thread_number: z.number().int().positive(),
	receiver: githubLogin,
	amount_sats: sats('The amount'),
	kind: z.enum(['now', 'on_merge']),
	note: note.optional()
});
export type TipCommentInput = z.input<typeof tipComment>;

/** The first problem with `value`, as a message for the field, or `null` when it is valid. */
export function firstIssue<T>(schema: z.ZodType<T>, value: unknown): string | null {
	const result = schema.safeParse(value);
	return result.success ? null : (result.error.issues[0]?.message ?? 'This value is not valid.');
}
