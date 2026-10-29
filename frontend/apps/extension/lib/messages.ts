// Messages from the popup and content scripts to the background worker, which alone holds the
// API token and makes API calls (content-script fetches would be subject to github.com's CORS).
import { browser } from 'wxt/browser';
import type { Me, ReceiveStatus, TipCommentRequest } from '@mergetip/api-client';

export type Request =
	| { type: 'status' }
	| { type: 'receive-status'; login: string }
	| { type: 'post-tip'; body: TipCommentRequest }
	| { type: 'store-token'; token: string; expires_at: string; login: string }
	| { type: 'disconnect' }
	| { type: 'open-connect' };

export type Status = { connected: false } | { connected: true; me: Me };

export interface Responses {
	status: Status;
	'receive-status': ReceiveStatus;
	'post-tip': { comment_url: string };
	'store-token': null;
	disconnect: null;
	'open-connect': null;
}

/** What crosses the message boundary: errors travel as their stable code plus human copy. */
export type Reply<T> = { ok: true; data: T } | { ok: false; code: string; message: string };

export class BackgroundError extends Error {
	constructor(
		readonly code: string,
		message: string
	) {
		super(message);
	}
}

/** Sends a request to the background worker and unwraps its reply. */
export async function ask<R extends Request>(request: R): Promise<Responses[R['type']]> {
	const reply = (await browser.runtime.sendMessage(request)) as
		Reply<Responses[R['type']]> | undefined;
	if (!reply) throw new BackgroundError('no_reply', 'MergeTip did not answer. Reload the page.');
	if (!reply.ok) throw new BackgroundError(reply.code, reply.message);
	return reply.data;
}
