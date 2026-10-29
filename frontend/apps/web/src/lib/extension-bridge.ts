import { isExtensionMessage, type ExtensionMessage, type WebMessage } from '@mergetip/api-client';

/** Posts `message` to the extension's content script and waits for a reply of type `expect`. */
function exchange<T extends ExtensionMessage['type']>(
	message: WebMessage,
	expect: readonly T[],
	timeoutMs: number
): Promise<Extract<ExtensionMessage, { type: T }> | null> {
	return new Promise((resolve) => {
		const timer = setTimeout(() => finish(null), timeoutMs);
		function finish(reply: Extract<ExtensionMessage, { type: T }> | null) {
			clearTimeout(timer);
			window.removeEventListener('message', onMessage);
			resolve(reply);
		}
		function onMessage(event: MessageEvent) {
			if (event.source !== window || event.origin !== location.origin) return;
			const data: unknown = event.data;
			if (isExtensionMessage(data) && (expect as readonly string[]).includes(data.type)) {
				finish(data as Extract<ExtensionMessage, { type: T }>);
			}
		}
		window.addEventListener('message', onMessage);
		window.postMessage(message, location.origin);
	});
}

/** Resolves with the extension's version, or `null` when it is not installed. */
export async function detectExtension(timeoutMs = 1500): Promise<string | null> {
	const reply = await exchange({ source: 'mergetip-web', type: 'hello' }, ['ready'], timeoutMs);
	return reply?.version ?? null;
}

/** Hands the API token to the extension; resolves with an error message, or `null` on success. */
export async function handOver(
	token: string,
	expiresAt: string,
	login: string
): Promise<string | null> {
	const reply = await exchange(
		{ source: 'mergetip-web', type: 'token', token, expires_at: expiresAt, login },
		['stored', 'error'],
		5000
	);
	if (!reply) return 'The extension did not answer. Reload this page and try again.';
	return reply.type === 'error' ? reply.message : null;
}
