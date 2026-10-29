import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Fails on any WCAG 2.1 A/AA violation on the current page, in both colour themes. */
export async function expectAccessible(page: Page): Promise<void> {
	for (const theme of ['light', 'dark'] as const) {
		await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		const summary = results.violations.map(
			(v) => `${theme}: ${v.id} (${v.impact}) ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
		);
		expect(summary).toEqual([]);
	}
}
