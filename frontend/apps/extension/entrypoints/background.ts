import { ApiError, MergeTipApi, schemas } from '@mergetip/api-client';
import { browser, type Browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { API_URL, WEB_URL } from '../lib/config';
import type { Reply, Request } from '../lib/messages';
import { clearToken, readToken, saveToken } from '../lib/token-store';

// Holds the short-lived API token and makes every API call. Never sees NWC secrets.
export default defineBackground(() => {
	const api = new MergeTipApi({
		baseUrl: API_URL,
		getToken: async () => (await readToken())?.token ?? null
	});

	async function handle(request: Request, sender: Browser.runtime.MessageSender) {
		switch (request.type) {
			case 'store-token': {
				// Only the web app's connect page may hand over a token.
				if (!sender.url || new URL(sender.url).origin !== WEB_URL) {
					throw new ApiError(403, 'csrf_rejected');
				}
				const { token, expires_at, login } = request;
				await saveToken({ token, expires_at, login });
				return null;
			}
			case 'status': {
				if (!(await readToken())) return { connected: false } as const;
				return { connected: true, me: await api.me() } as const;
			}
			case 'receive-status':
				return api.receiveStatus(schemas.githubLogin.parse(request.login));
			case 'post-tip':
				return api.postTipComment(schemas.tipComment.parse(request.body));
			case 'disconnect':
				await clearToken();
				return null;
			case 'open-connect':
				await browser.tabs.create({ url: `${WEB_URL}/extension/connect` });
				return null;
		}
	}

	browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
		// Accept messages from this extension's own pages and content scripts only.
		if (sender.id !== browser.runtime.id) return false;
		const request = message as Request;
		handle(request, sender)
			.then((data) => sendResponse({ ok: true, data } satisfies Reply<unknown>))
			.catch(async (error: unknown) => {
				if (error instanceof ApiError) {
					// A revoked or expired token: forget it so the popup offers to reconnect.
					if (error.isUnauthenticated) await clearToken();
					sendResponse({ ok: false, code: error.code, message: error.message });
				} else if (error instanceof Error && error.name === 'ZodError') {
					sendResponse({ ok: false, code: 'invalid_tip', message: 'This tip is not valid.' });
				} else {
					console.error('MergeTip background error', error);
					sendResponse({ ok: false, code: 'internal', message: 'Something went wrong.' });
				}
			});
		return true; // keeps the channel open for the async reply
	});
});
