import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run the production build against a mocked API (see e2e/api.ts), so they need
// no backend, GitHub account or wallet. Set PW_CHANNEL= to use Playwright's bundled Chromium.
export default defineConfig({
	testDir: 'e2e',
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		...devices['Desktop Chrome'],
		channel: process.env.PW_CHANNEL ?? 'chrome',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'pnpm build && pnpm preview --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		env: { PUBLIC_API_URL: 'http://localhost:8080' }
	}
});
