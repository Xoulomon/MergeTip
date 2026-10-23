import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_API_URL: {
		public: true,
		description: 'Base URL of the MergeTip API (backend/crates/api).',
		schema: (value) => value ?? 'http://localhost:8080'
	}
});
