<script lang="ts">
	import type { Tip } from '@mergetip/api-client';
	import { Avatar, formatCountdown, formatDateTime, formatSats } from '@mergetip/ui';
	import { Clock } from '#lib/clock.svelte.ts';

	let { tip }: { tip: Tip } = $props();

	const clock = new Clock(60_000);
	let left = $derived(tip.expires_at ? Date.parse(tip.expires_at) - clock.now : null);
</script>

<div class="flex flex-col items-center gap-3 text-center">
	<Avatar login={tip.sender.login} src={tip.sender.avatar_url || undefined} size={64} />
	<h1 class="text-2xl font-semibold text-balance">
		You have <span class="text-bolt">{formatSats(tip.amount_sats)}</span> from
		<a class="hover:underline" href="https://github.com/{tip.sender.login}">@{tip.sender.login}</a>
	</h1>
	<p class="text-fg-muted">
		for
		<a class="text-fg hover:underline" href={tip.thread_url}>{tip.repo}#{tip.thread_number}</a>
	</p>
	{#if tip.note}
		<blockquote class="max-w-md border-l-4 border-default pl-3 text-left text-sm text-fg-muted">
			{tip.note}
		</blockquote>
	{/if}
	{#if left !== null && tip.expires_at && tip.state === 'pledged'}
		<p class="text-sm text-fg-muted">
			Claim within <strong class="text-fg tabular-nums">{formatCountdown(left)}</strong>
			<span class="sr-only">(by {formatDateTime(tip.expires_at)})</span>
		</p>
	{/if}
</div>
