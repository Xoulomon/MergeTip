import { afterEach, describe, expect, it, vi } from 'vitest';
import { BACKOFF_MS, pollUntil } from './poll.ts';

describe('pollUntil', () => {
	afterEach(() => vi.useRealTimers());

	it('stays inside the claims rate limit', () => {
		// Plus the page's first GET and the POST: at most 10 claim requests in a minute.
		expect(BACKOFF_MS.length + 2).toBeLessThanOrEqual(10);
		expect(BACKOFF_MS.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(45_000);
	});

	it('stops as soon as the value is done, skipping failed checks', async () => {
		vi.useFakeTimers();
		const check = vi
			.fn<() => Promise<string>>()
			.mockResolvedValueOnce('paying')
			.mockRejectedValueOnce(new Error('429'))
			.mockResolvedValueOnce('paid');
		const result = pollUntil(check, (state) => state === 'paid', { delays: [10, 10, 10, 10] });
		await vi.runAllTimersAsync();
		await expect(result).resolves.toBe('paid');
		expect(check).toHaveBeenCalledTimes(3);
	});

	it('gives up after the last delay with the last value seen', async () => {
		vi.useFakeTimers();
		const check = vi.fn(() => Promise.resolve('paying'));
		const result = pollUntil(check, () => false, { delays: [10, 20] });
		await vi.runAllTimersAsync();
		await expect(result).resolves.toBe('paying');
		expect(check).toHaveBeenCalledTimes(2);
	});

	it('stops when aborted', async () => {
		vi.useFakeTimers();
		const controller = new AbortController();
		const check = vi.fn(() => Promise.resolve('paying'));
		const result = pollUntil(check, () => false, { delays: [1000], signal: controller.signal });
		controller.abort();
		await vi.runAllTimersAsync();
		await expect(result).resolves.toBeNull();
		expect(check).not.toHaveBeenCalled();
	});
});
