import './style.css';
import { mount, unmount } from 'svelte';
import { browser } from 'wxt/browser';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { defineContentScript } from 'wxt/utils/define-content-script';
import TipPanel from '../../components/TipPanel.svelte';
import { parseThread, threadAuthor, viewerLogin } from '../../lib/github';
import { injectButtons } from '../../lib/inject';

// Adds ⚡ Tip buttons to pull requests and issues on github.com (FR-8.1). GitHub is a single-page
// app, so the page is re-scanned on Turbo navigations and DOM changes.
export default defineContentScript({
	matches: ['https://github.com/*'],
	cssInjectionMode: 'ui',
	async main(ctx) {
		let panel: Awaited<ReturnType<typeof createShadowRootUi<ReturnType<typeof mount>>>> | null =
			null;

		async function openTip(receiver: string) {
			const thread = parseThread(location.pathname);
			if (!thread) return;
			panel?.remove();
			panel = await createShadowRootUi(ctx, {
				name: 'mergetip-tip',
				position: 'modal',
				zIndex: 2147483000,
				mode: 'closed',
				isolateEvents: true,
				onMount: (container) =>
					mount(TipPanel, {
						target: container,
						props: { thread, receiver, onclose: () => panel?.remove() }
					}),
				onRemove: (app) => app && unmount(app)
			});
			panel.mount();
		}

		let scheduled = false;
		function scan() {
			if (scheduled) return;
			scheduled = true;
			// Batch bursts of DOM mutations into one scan per frame.
			ctx.requestAnimationFrame(() => {
				scheduled = false;
				if (parseThread(location.pathname)) injectButtons(document, viewerLogin(document), openTip);
			});
		}

		const observer = new MutationObserver(scan);
		observer.observe(document.body, { childList: true, subtree: true });
		ctx.onInvalidated(() => observer.disconnect());
		ctx.addEventListener(document, 'turbo:load', scan);
		ctx.addEventListener(window, 'wxt:locationchange', scan);
		scan();

		// The popup asks which thread author to suggest.
		browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
			if ((message as { type?: string } | null)?.type !== 'thread-author') return false;
			sendResponse(parseThread(location.pathname) ? threadAuthor(document) : null);
			return false;
		});
	}
});
