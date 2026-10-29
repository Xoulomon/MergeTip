/**
 * Waits between checks so a page stays inside the API's rate limits (claims: 10 a minute per
 * user). Six checks over about 50 seconds cover a normal Lightning payment.
 */
export const BACKOFF_MS = [1_500, 3_000, 5_000, 8_000, 13_000, 20_000] as const;

/**
 * Calls `check` after each delay until `done` says so, the delays run out, or `signal` aborts.
 * Failed checks (network, 429) are skipped, not fatal. Resolves with the last value seen, or
 * `null` if no check succeeded.
 */
export async function pollUntil<T>(
	check: () => Promise<T>,
	done: (value: T) => boolean,
	{ delays = BACKOFF_MS, signal }: { delays?: readonly number[]; signal?: AbortSignal } = {}
): Promise<T | null> {
	let last: T | null = null;
	for (const delay of delays) {
		await new Promise<void>((resolve) => {
			const timer = setTimeout(resolve, delay);
			signal?.addEventListener('abort', () => (clearTimeout(timer), resolve()), { once: true });
		});
		if (signal?.aborted) break;
		try {
			last = await check();
			if (done(last)) break;
		} catch {
			// Keep waiting: the next check may succeed.
		}
	}
	return last;
}
