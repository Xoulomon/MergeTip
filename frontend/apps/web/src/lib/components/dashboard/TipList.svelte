<script lang="ts">
	import { Alert, Button, Spinner } from '@mergetip/ui';
	import type { TipFeed } from '#lib/tip-feed.svelte.ts';
	import TipItem from './TipItem.svelte';
	import type { Snippet } from 'svelte';

	let { feed, login, empty }: { feed: TipFeed; login: string; empty: Snippet } = $props();

	let sentinel: HTMLElement | undefined = $state();

	// Loads the next page when the end of the list scrolls into view.
	$effect(() => {
		if (!sentinel || feed.done) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) void feed.loadMore();
			},
			{ rootMargin: '200px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

{#if feed.items.length > 0}
	<ul class="divide-y divide-default">
		{#each feed.items as tip (tip.id)}
			<TipItem {tip} {login} />
		{/each}
	</ul>
{:else if feed.done && !feed.error}
	<div class="px-4 py-10 text-center">{@render empty()}</div>
{/if}

<div class="px-4 py-3" aria-live="polite">
	{#if feed.error}
		<Alert onretry={() => feed.loadMore()}>{feed.error}</Alert>
	{:else if feed.loading}
		<p class="flex items-center justify-center gap-2 text-sm text-fg-muted">
			<Spinner /> Loading tips…
		</p>
	{:else if !feed.done}
		<div bind:this={sentinel} class="flex justify-center">
			<Button size="sm" onclick={() => feed.loadMore()}>Load more</Button>
		</div>
	{/if}
</div>
