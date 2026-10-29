<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Button, Card, formatSats } from '@mergetip/ui';
	import BudgetBar from '#lib/components/dashboard/BudgetBar.svelte';
	import TipList from '#lib/components/dashboard/TipList.svelte';
	import { INSTALL_APP_URL } from '#lib/links.ts';
	import { session } from '#lib/session.svelte.ts';
	import { TipFeed } from '#lib/tip-feed.svelte.ts';
	import { TABS, totals, type Tab } from '#lib/tips.ts';

	const feeds = {
		sent: new TipFeed('sent'),
		received: new TipFeed('received'),
		pending: new TipFeed('pending')
	};
	let tab = $state<Tab>('sent');

	let me = $derived(session.me);
	let feed = $derived(feeds[tab]);
	// The pending feed lists every tip both ways, so the totals come from it.
	let sums = $derived(me ? totals(feeds.pending.all, me.github_login) : null);

	onMount(() => void feeds.pending.loadMore());
	// Each tab loads its first page the first time it is shown.
	$effect(() => {
		if (!feed.started) untrack(() => void feed.loadMore());
	});

	function onTabKey(event: KeyboardEvent, index: number) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		const next = TABS[(index + step + TABS.length) % TABS.length];
		if (!next) return;
		tab = next.id;
		document.getElementById(`tab-${next.id}`)?.focus();
	}
</script>

<svelte:head><title>Dashboard · MergeTip</title></svelte:head>

{#if me}
	<h1 class="mb-6 text-2xl font-semibold">Dashboard</h1>

	{#if !me.wallet.connected || !me.lightning_address}
		<div class="mb-6 grid gap-3 sm:grid-cols-2">
			{#if !me.wallet.connected}
				<Card title="Connect a wallet to send tips" headingLevel={2}>
					<p class="text-sm text-fg-muted">Your /tip comments wait until a wallet is connected.</p>
					<Button class="mt-3" variant="primary" href="/settings/wallet">Connect wallet</Button>
				</Card>
			{/if}
			{#if !me.lightning_address}
				<Card title="Add a Lightning address to receive" headingLevel={2}>
					<p class="text-sm text-fg-muted">Without one, tips to you wait as 30-day pledges.</p>
					<Button class="mt-3" href="/settings/receive">Set up receiving</Button>
				</Card>
			{/if}
		</div>
	{/if}

	<section aria-label="Totals" class="grid gap-3 sm:grid-cols-3">
		{#each [{ label: 'Sent', value: sums?.sentSats }, { label: 'Received', value: sums?.receivedSats }, { label: 'Pending', value: sums?.pendingSats }] as stat (stat.label)}
			<div class="rounded-md border border-default p-4">
				<p class="text-sm text-fg-muted">{stat.label}</p>
				<p class="mt-1 text-xl font-semibold tabular-nums">
					{feeds.pending.all.length || feeds.pending.done ? formatSats(stat.value ?? 0) : '…'}
				</p>
			</div>
		{/each}
	</section>
	{#if !feeds.pending.done && feeds.pending.all.length > 0}
		<p class="mt-2 text-xs text-fg-muted">
			Totals cover your {feeds.pending.all.length} most recent tips.
		</p>
	{/if}

	<div class="mt-4 rounded-md border border-default p-4">
		<BudgetBar spent={me.caps.spent_today_sats} max={me.caps.daily_max_sats} />
	</div>

	<section class="mt-6 rounded-md border border-default" aria-label="Tips">
		<div role="tablist" aria-label="Tips" class="flex border-b border-default bg-subtle px-2">
			{#each TABS as item, index (item.id)}
				<button
					id="tab-{item.id}"
					type="button"
					role="tab"
					aria-selected={tab === item.id}
					aria-controls="tips-panel"
					tabindex={tab === item.id ? 0 : -1}
					class="-mb-px border-b-2 px-3 py-2 text-sm {tab === item.id
						? 'border-bolt font-semibold'
						: 'border-transparent text-fg-muted hover:text-fg'}"
					onclick={() => (tab = item.id)}
					onkeydown={(event) => onTabKey(event, index)}>{item.label}</button
				>
			{/each}
		</div>
		<div id="tips-panel" role="tabpanel" aria-labelledby="tab-{tab}">
			<TipList {feed} login={me.github_login}>
				{#snippet empty()}
					{#if tab === 'sent'}
						<p class="font-semibold">No tips sent yet</p>
						<p class="mt-1 text-sm text-fg-muted">
							Comment <code class="font-mono">/tip @user 2100</code> on a pull request in a repository
							with the app installed.
						</p>
						<Button class="mt-4" href={INSTALL_APP_URL}>Install GitHub App</Button>
					{:else if tab === 'received'}
						<p class="font-semibold">No tips received yet</p>
						<p class="mt-1 text-sm text-fg-muted">When someone tips your work, it shows up here.</p>
					{:else}
						<p class="font-semibold">Nothing pending</p>
						<p class="mt-1 text-sm text-fg-muted">
							Tips waiting for a merge, a claim or your confirmation appear here.
						</p>
					{/if}
				{/snippet}
			</TipList>
		</div>
	</section>
{/if}
