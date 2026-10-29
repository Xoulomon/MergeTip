import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// One `.env` at the repository root serves the backend and the web app.
const ENV_DIR = '../../..';

// Hosts the Breez SDK (Spark) talks to from the browser, read from its WASM build. Several
// services use non-default ports (e.g. datasync on 442), hence `:*`. `breez.tips` is the
// Lightning address domain, set by Breez's servers rather than in the build. Keep in sync
// when upgrading @breeztech/breez-sdk-spark.
const BREEZ_HOSTS = [
	'https://*.breez.technology:*',
	'wss://*.breez.technology:*',
	'https://breez.tips',
	'https://*.lightspark.com:*',
	'https://*.flashnet.xyz:*',
	'https://*.sparkinfra.net:*',
	'https://mempool.space',
	'https://cloudflare-dns.com'
] as const;

/** An origin as a CSP host source, e.g. `http://localhost:8080`. */
function hostSource(url: string): `${string}://${string}.${string}` {
	const { origin } = new URL(url);
	if (origin === 'null') throw new Error(`${url} has no origin`);
	// `localhost` has no dot, but CSP accepts it; the template type cannot express both.
	return origin as `${string}://${string}.${string}`;
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, ENV_DIR, 'PUBLIC_');
	const api = hostSource(env.PUBLIC_API_URL || 'http://localhost:8080');

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				adapter: adapter(),
				env: { dir: ENV_DIR },
				csp: {
					mode: 'auto',
					directives: {
						'default-src': ['self'],
						// WebAssembly for the in-browser wallet; no other dynamic code.
						'script-src': ['self', 'wasm-unsafe-eval'],
						// SvelteKit and Svelte set some inline styles (e.g. the route announcer). Styles
						// cannot run code, so this is the usual trade-off; scripts stay nonce-only.
						'style-src': ['self', 'unsafe-inline'],
						'img-src': ['self', 'data:', 'https://avatars.githubusercontent.com'],
						'connect-src': ['self', api, ...BREEZ_HOSTS],
						'font-src': ['self'],
						'form-action': ['self'],
						'frame-ancestors': ['none'],
						'base-uri': ['self'],
						'object-src': ['none']
					}
				}
			})
		],
		test: {
			environment: 'jsdom',
			include: ['src/**/*.test.ts']
		},
		// Component tests render in jsdom, so Svelte must resolve its browser build.
		...(process.env.VITEST ? { resolve: { conditions: ['browser'] } } : {})
	};
});
