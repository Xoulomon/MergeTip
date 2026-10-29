// The handshake between the web app's /extension/connect page and the browser extension.
// It runs over `window.postMessage` on that page only, which works in Chrome and Firefox alike
// (Firefox has no `externally_connectable`). Both sides check `event.source === window` and
// the origin, so other pages and frames cannot take part.

export const CONNECT_PATH = '/extension/connect';

export type WebMessage =
	| { source: 'mergetip-web'; type: 'hello' }
	| { source: 'mergetip-web'; type: 'token'; token: string; expires_at: string; login: string };

export type ExtensionMessage =
	| { source: 'mergetip-extension'; type: 'ready'; version: string }
	| { source: 'mergetip-extension'; type: 'stored' }
	| { source: 'mergetip-extension'; type: 'error'; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function isWebMessage(value: unknown): value is WebMessage {
	if (!isRecord(value) || value.source !== 'mergetip-web') return false;
	if (value.type === 'hello') return true;
	return (
		value.type === 'token' &&
		typeof value.token === 'string' &&
		typeof value.expires_at === 'string' &&
		typeof value.login === 'string'
	);
}

export function isExtensionMessage(value: unknown): value is ExtensionMessage {
	return (
		isRecord(value) &&
		value.source === 'mergetip-extension' &&
		(value.type === 'ready' || value.type === 'stored' || value.type === 'error')
	);
}
