import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// Set WXT_API_URL and WXT_WEB_URL when building for staging or production.
const API_URL = new URL(process.env.WXT_API_URL || 'http://localhost:8080').origin;

// Manifest V3 for Chrome and Firefox (FR-8.5). The extension needs storage for its token, and
// host access to github.com (buttons) and the MergeTip API (calls without CORS). Nothing else.
export default defineConfig({
	modules: ['@wxt-dev/module-svelte'],
	// WXT defaults Firefox to MV2; the PRD asks for MV3 in both browsers.
	manifestVersion: 3,
	vite: () => ({ plugins: [tailwindcss()] }),
	manifest: {
		name: 'MergeTip',
		description: 'One-click ⚡ tips in sats for open-source contributors on GitHub.',
		permissions: ['storage'],
		host_permissions: ['https://github.com/*', `${API_URL}/*`],
		action: { default_title: 'MergeTip' },
		icons: { 16: 'icon-16.png', 32: 'icon-32.png', 48: 'icon-48.png', 128: 'icon-128.png' },
		browser_specific_settings: {
			gecko: { id: 'extension@mergetip.dev', strict_min_version: '115.0' }
		}
	}
});
