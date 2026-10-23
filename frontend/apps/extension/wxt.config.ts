import { defineConfig } from 'wxt';

// Manifest V3 for Chrome and Firefox. Minimal permissions: github.com host only (FR-8.5).
export default defineConfig({
	modules: ['@wxt-dev/module-svelte'],
	manifest: {
		name: 'MergeTip',
		description: 'One-click ⚡ tips for open-source contributors on GitHub.',
		permissions: ['storage'],
		host_permissions: ['https://github.com/*']
	}
});
