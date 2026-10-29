import { createSubscriber } from 'svelte/reactivity';

/**
 * The current time, re-read every `intervalMs` while something reactive is reading it. The
 * timer stops by itself when nothing on the page uses it any more.
 */
export class Clock {
	#subscribe;

	constructor(intervalMs = 1000) {
		this.#subscribe = createSubscriber((update) => {
			const timer = setInterval(update, intervalMs);
			return () => clearInterval(timer);
		});
	}

	get now(): number {
		this.#subscribe();
		return Date.now();
	}
}
