import type { Tip } from '@mergetip/api-client';
import { api } from './api.ts';
import { handleError } from './run.ts';
import { belongsTo, directionFor, type Tab } from './tips.ts';

/** One dashboard tab's tips, loaded a page (50) at a time with the API's cursor. */
export class TipFeed {
	items = $state<Tip[]>([]);
	/** Everything the API returned, before this tab's filter: what dashboard totals add up. */
	all = $state<Tip[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	done = $state(false);
	/** Set by the first load, so a failed first page is retried only on request. */
	started = $state(false);
	#cursor: string | null = null;
	#generation = 0;

	constructor(readonly tab: Tab) {}

	async loadMore(): Promise<void> {
		if (this.loading || this.done) return;
		const generation = this.#generation;
		this.started = true;
		this.loading = true;
		this.error = null;
		try {
			const page = await api.tips({
				direction: directionFor(this.tab),
				...(this.#cursor ? { cursor: this.#cursor } : {})
			});
			if (generation !== this.#generation) return;
			this.all.push(...page.items);
			this.items.push(...page.items.filter((tip) => belongsTo(this.tab, tip)));
			this.#cursor = page.next_cursor ?? null;
			this.done = this.#cursor === null;
		} catch (error) {
			if (generation === this.#generation) this.error = handleError(error);
		} finally {
			if (generation === this.#generation) this.loading = false;
		}
	}

	/** Starts over from the newest tips, dropping any request still in flight. */
	reload(): Promise<void> {
		this.#generation++;
		this.items = [];
		this.all = [];
		this.#cursor = null;
		this.done = false;
		this.loading = false;
		return this.loadMore();
	}
}
