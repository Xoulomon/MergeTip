import type { Tip, TipDirection } from '@mergetip/api-client';
import { PENDING_STATES } from '@mergetip/ui';

export type Tab = 'sent' | 'received' | 'pending';

export const TABS: { id: Tab; label: string }[] = [
	{ id: 'sent', label: 'Sent' },
	{ id: 'received', label: 'Received' },
	{ id: 'pending', label: 'Pending' }
];

/** The API has no "pending" direction, so that tab lists everything and filters by state. */
export function directionFor(tab: Tab): TipDirection {
	return tab === 'pending' ? 'all' : tab;
}

export function isPending(tip: Tip): boolean {
	return PENDING_STATES.includes(tip.state);
}

export function belongsTo(tab: Tab, tip: Tip): boolean {
	return tab !== 'pending' || isPending(tip);
}

export interface Totals {
	sentSats: number;
	receivedSats: number;
	pendingSats: number;
}

/** Sums settled tips each way, and tips still in flight either way. */
export function totals(tips: readonly Tip[], login: string): Totals {
	const me = login.toLowerCase();
	const result: Totals = { sentSats: 0, receivedSats: 0, pendingSats: 0 };
	for (const tip of tips) {
		if (tip.state === 'paid') {
			if (tip.sender.login.toLowerCase() === me) result.sentSats += tip.amount_sats;
			if (tip.receiver.login.toLowerCase() === me) result.receivedSats += tip.amount_sats;
		} else if (isPending(tip)) {
			result.pendingSats += tip.amount_sats;
		}
	}
	return result;
}

/** The other person in a tip, from the viewer's side. */
export function counterparty(
	tip: Tip,
	login: string
): { role: 'to' | 'from'; login: string; avatar_url: string } {
	return tip.sender.login.toLowerCase() === login.toLowerCase()
		? { role: 'to', ...tip.receiver }
		: { role: 'from', ...tip.sender };
}
