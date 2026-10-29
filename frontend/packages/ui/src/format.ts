/** Formatting shared by the web app and the extension. */

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'bolt';

/** A tip state as the API reports it. Kept here as a string union so the UI has no API dependency. */
export type TipStateName =
	| 'received'
	| 'awaiting_sender'
	| 'verifying'
	| 'awaiting_confirmation'
	| 'held'
	| 'paying'
	| 'paid'
	| 'pledged'
	| 'rejected'
	| 'cancelled'
	| 'expired'
	| 'failed';

const groups = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** `2100` → `2,100 sats`. Amounts always carry thousands separators and the word "sats". */
export function formatSats(amount: number): string {
	return `${groups.format(amount)} ${amount === 1 ? 'sat' : 'sats'}`;
}

/** `2100` → `2,100`, for places where "sats" is already in the label. */
export function formatNumber(amount: number): string {
	return groups.format(amount);
}

const STATES: Record<TipStateName, { label: string; tone: Tone }> = {
	paid: { label: 'Paid', tone: 'success' },
	pledged: { label: 'Waiting for claim', tone: 'bolt' },
	held: { label: 'Pays on merge', tone: 'info' },
	awaiting_confirmation: { label: 'Needs your confirmation', tone: 'warning' },
	awaiting_sender: { label: 'Waiting for wallet', tone: 'warning' },
	received: { label: 'Processing', tone: 'neutral' },
	verifying: { label: 'Processing', tone: 'neutral' },
	paying: { label: 'Processing', tone: 'neutral' },
	rejected: { label: 'Rejected', tone: 'danger' },
	failed: { label: 'Failed', tone: 'danger' },
	cancelled: { label: 'Cancelled', tone: 'neutral' },
	expired: { label: 'Expired', tone: 'neutral' }
};

export function stateLabel(state: TipStateName): string {
	return STATES[state].label;
}

export function stateTone(state: TipStateName): Tone {
	return STATES[state].tone;
}

/** States in which a tip is still moving and no money has settled. */
export const PENDING_STATES: readonly TipStateName[] = [
	'received',
	'awaiting_sender',
	'verifying',
	'awaiting_confirmation',
	'held',
	'paying',
	'pledged'
];

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 24 * 3600],
	['month', 30 * 24 * 3600],
	['week', 7 * 24 * 3600],
	['day', 24 * 3600],
	['hour', 3600],
	['minute', 60]
];

/** `2026-10-28T10:00Z` → `3 hours ago` (or `in 2 days` for future dates). */
export function formatRelativeTime(date: Date | string, now: number = Date.now()): string {
	const seconds = Math.round((new Date(date).getTime() - now) / 1000);
	for (const [unit, size] of UNITS) {
		if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
	}
	return 'just now';
}

/** An absolute timestamp for `title` attributes and screen readers. */
export function formatDateTime(date: Date | string): string {
	return new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Milliseconds → `59:07` or `2d 4h`, for countdowns. Negative durations read `0:00`. */
export function formatCountdown(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	const days = Math.floor(total / 86_400);
	const hours = Math.floor((total % 86_400) / 3600);
	if (days > 0) return `${days}d ${hours}h`;
	const minutes = Math.floor((total % 3600) / 60);
	const seconds = String(total % 60).padStart(2, '0');
	return hours > 0
		? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
		: `${minutes}:${seconds}`;
}

/** Shortens a hash for display: `a1b2c3…7890`. */
export function truncateMiddle(value: string, head = 6, tail = 4): string {
	return value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}
