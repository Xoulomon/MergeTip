/** The API's error envelope: `{"error":{"code":"snake_case","message":"..."}}`. */
export interface ErrorEnvelope {
	error: { code: string; message: string };
}

/** Codes the client produces itself, without a response from the API. */
export const CLIENT_CODES = {
	network: 'network_error',
	timeout: 'timeout',
	unexpected: 'unexpected_response'
} as const;

/**
 * Human copy for every stable error code the API returns. The API's own `message` is for
 * developers, so the UI shows these instead and never a raw code.
 */
const MESSAGES: Record<string, string> = {
	unauthenticated: 'Your session has ended. Sign in with GitHub to continue.',
	reauth_required: 'For your safety, sign in with GitHub again to loosen this protection.',
	github_reauth_required: 'Sign in with GitHub again so MergeTip can post on your behalf.',
	csrf_rejected: 'This request was blocked because it did not come from MergeTip.',
	rate_limited: 'Too many requests. Wait a minute and try again.',
	not_found: 'We could not find that.',
	internal: 'Something went wrong on our side. Try again in a moment.',
	service_unavailable: 'MergeTip is briefly unavailable. Try again in a moment.',

	nwc_invalid_uri:
		'That is not a valid wallet connection string. It starts with nostr+walletconnect://',
	nwc_unreachable: 'We could not reach your wallet. Check it is online and try again.',
	nwc_missing_pay_invoice:
		'This connection cannot pay invoices. Create one with the pay_invoice permission.',

	lnurl_invalid:
		"That Lightning address can't receive tips safely: its payment details didn't pass MergeTip's checks. Try an address from another wallet.",
	lnurl_unreachable: 'We could not reach that Lightning address. Check the spelling and try again.',

	invalid_setting: 'One of these values is out of range.',
	invalid_query: 'That filter is not valid.',
	invalid_tip: 'This tip is not valid. Check the receiver and amount.',

	claim_not_found: 'This claim link is not valid.',
	claim_expired: 'This pledge has expired, so it can no longer be claimed.',
	already_claimed: 'This pledge has already been claimed.',
	not_receiver:
		'This pledge belongs to another GitHub account. Sign in as the receiver to claim it.',
	no_address: 'Add a Lightning address to receive these sats.',

	not_sender: 'Only the sender of this tip can confirm it.',
	not_awaiting_confirmation: 'This tip no longer needs confirmation.',
	confirmation_expired: 'The confirmation window has closed, so this tip was cancelled.',
	otp_invalid: 'That code is not right. Check your email and try again.',
	otp_not_enabled: 'Email codes are not turned on for your account.',
	otp_rate_limited: 'You asked for a code recently. Wait a minute before asking again.',
	otp_unavailable: 'We could not send a code right now. Try again in a moment.',
	email_failed: 'We could not send the email. Try again in a moment.',

	app_not_installed: 'The MergeTip GitHub App is not installed on this repository.',
	github_forbidden: 'GitHub did not allow MergeTip to post here.',
	github_unavailable: 'GitHub is not responding. Try again in a moment.',

	[CLIENT_CODES.network]: 'Could not reach MergeTip. Check your connection and try again.',
	[CLIENT_CODES.timeout]: 'MergeTip took too long to answer. Try again.',
	[CLIENT_CODES.unexpected]: 'MergeTip sent an unexpected answer. Try again in a moment.'
};

/** A failed API call, with a stable `code` and copy that is safe to show to people. */
export class ApiError extends Error {
	override readonly name = 'ApiError';

	constructor(
		readonly status: number,
		readonly code: string,
		/** The API's developer-facing message, kept for debugging; never shown in the UI. */
		readonly detail = ''
	) {
		super(messageFor(code));
	}

	/** True when the request never got an HTTP answer, so retrying may help. */
	get isNetwork(): boolean {
		return this.status === 0;
	}

	get isUnauthenticated(): boolean {
		return this.status === 401 && this.code === 'unauthenticated';
	}

	get needsReauth(): boolean {
		return this.code === 'reauth_required' || this.code === 'github_reauth_required';
	}
}

/** The human message for an error code, falling back to a generic one for unknown codes. */
export function messageFor(code: string): string {
	return MESSAGES[code] ?? 'Something went wrong. Try again in a moment.';
}

export function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
	if (typeof value !== 'object' || value === null || !('error' in value)) return false;
	const { error } = value;
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof error.code === 'string' &&
		'message' in error &&
		typeof error.message === 'string'
	);
}

/** Builds an [`ApiError`] from a non-2xx response body, whatever shape it has. */
export function errorFromResponse(status: number, body: unknown): ApiError {
	if (isErrorEnvelope(body)) return new ApiError(status, body.error.code, body.error.message);
	if (status === 401) return new ApiError(status, 'unauthenticated');
	if (status === 429) return new ApiError(status, 'rate_limited');
	if (status >= 500) return new ApiError(status, 'internal');
	return new ApiError(status, CLIENT_CODES.unexpected);
}
