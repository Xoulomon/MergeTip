import { CONNECT_PATH, isWebMessage, type ExtensionMessage } from '@mergetip/api-client/bridge';
import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { webMatch } from '../lib/config';
import { ask } from '../lib/messages';

// Runs only on the web app's /extension/connect page and relays the API token it hands over.
export default defineContentScript({
	matches: [webMatch(CONNECT_PATH)],
	main(ctx) {
		const reply = (message: ExtensionMessage) => window.postMessage(message, location.origin);

		ctx.addEventListener(window, 'message', async (event) => {
			if (event.source !== window || event.origin !== location.origin) return;
			const data: unknown = event.data;
			if (!isWebMessage(data)) return;
			if (data.type === 'hello') {
				reply({
					source: 'mergetip-extension',
					type: 'ready',
					version: browser.runtime.getManifest().version
				});
				return;
			}
			try {
				await ask({
					type: 'store-token',
					token: data.token,
					expires_at: data.expires_at,
					login: data.login
				});
				reply({ source: 'mergetip-extension', type: 'stored' });
			} catch (error) {
				reply({
					source: 'mergetip-extension',
					type: 'error',
					message:
						error instanceof Error ? error.message : 'The extension could not save the token.'
				});
			}
		});
	}
});
