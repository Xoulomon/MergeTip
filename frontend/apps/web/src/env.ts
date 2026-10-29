import { defineEnvVars } from '@sveltejs/kit/env';

const url = (fallback: string) => (value: string | undefined) => {
	const raw = value || fallback;
	try {
		return new URL(raw).origin;
	} catch {
		throw new Error(`${raw} is not a URL`);
	}
};

export const variables = defineEnvVars({
	API_ORIGIN: {
		description:
			'Server only. When set, /v1/* and /healthz are relayed to this API origin, so a web app hosted apart from the API (e.g. Vercel + Render) shares one origin with it.',
		schema: (value) => (value ? url('http://localhost:8080')(value) : undefined)
	},
	PUBLIC_API_URL: {
		public: true,
		description: 'Origin of the MergeTip API (backend/crates/api), without /v1.',
		schema: url('http://localhost:8080')
	},
	PUBLIC_GITHUB_APP_SLUG: {
		public: true,
		description: 'The GitHub App slug, for the "Install GitHub App" link.',
		schema: (value) => value || 'mergetip'
	},
	PUBLIC_BREEZ_API_KEY: {
		public: true,
		description: 'Breez SDK API key for the in-browser wallet on the claim page. Empty hides it.',
		schema: (value) => value ?? ''
	},
	PUBLIC_BREEZ_NETWORK: {
		public: true,
		description: 'Network for the in-browser wallet: mainnet or regtest.',
		schema: (value) => {
			const network = value || 'mainnet';
			if (network !== 'mainnet' && network !== 'regtest') {
				throw new Error('PUBLIC_BREEZ_NETWORK must be mainnet or regtest');
			}
			return network;
		}
	},
	PUBLIC_ALBY_HUB_URL: {
		public: true,
		description: 'Alby Hub used for the one-click "Connect with Alby" link.',
		schema: url('https://my.albyhub.com')
	}
});
