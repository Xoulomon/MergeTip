// Injects ⚡ Tip buttons on PR headers, reviews, review comments and issue comments (FR-8.1).
export default defineContentScript({
	matches: ['https://github.com/*'],
	main() {
		// TODO(P5-02/P5-03): resilient selectors + MutationObserver for client-side navigation.
	}
});
