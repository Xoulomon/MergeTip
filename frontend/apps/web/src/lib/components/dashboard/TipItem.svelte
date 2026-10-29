<script lang="ts">
	import type { Tip } from '@mergetip/api-client';
	import {
		Avatar,
		SatsAmount,
		StateBadge,
		formatDateTime,
		formatRelativeTime,
		toasts,
		truncateMiddle
	} from '@mergetip/ui';
	import { counterparty } from '#lib/tips.ts';

	let { tip, login }: { tip: Tip; login: string } = $props();

	let other = $derived(counterparty(tip, login));
	let iSent = $derived(other.role === 'to');

	async function copyHash(hash: string) {
		try {
			await navigator.clipboard.writeText(hash);
			toasts.success('Payment hash copied.');
		} catch {
			toasts.error('Could not copy. Select the hash and copy it instead.');
		}
	}
</script>

<li class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
	<div class="flex min-w-0 flex-1 items-start gap-3">
		<Avatar login={other.login} src={other.avatar_url || undefined} size={32} />
		<div class="min-w-0">
			<p class="text-sm">
				<span class="text-fg-muted">{iSent ? 'To' : 'From'}</span>
				<a class="font-semibold hover:underline" href="https://github.com/{other.login}"
					>@{other.login}</a
				>
				<span class="text-fg-muted">in</span>
				<a class="hover:underline" href={tip.thread_url}>{tip.repo}#{tip.thread_number}</a>
			</p>
			{#if tip.note}<p class="truncate text-sm text-fg-muted">“{tip.note}”</p>{/if}
			<p class="mt-0.5 flex flex-wrap gap-x-3 text-xs text-fg-muted">
				<time datetime={tip.created_at} title={formatDateTime(tip.created_at)}>
					{formatRelativeTime(tip.created_at)}
				</time>
				{#if tip.kind === 'on_merge'}<span>On merge</span>{/if}
				{#if tip.payment_hash}
					{@const hash = tip.payment_hash}
					<button
						type="button"
						class="font-mono hover:text-fg hover:underline"
						title={hash}
						onclick={() => copyHash(hash)}
						><span class="sr-only">Copy payment hash </span>{truncateMiddle(hash)}</button
					>
				{/if}
			</p>
		</div>
	</div>
	<div class="flex items-center gap-3 pl-11 sm:pl-0">
		<SatsAmount amount={tip.amount_sats} class={iSent ? '' : 'text-success'} />
		{#if tip.state === 'awaiting_confirmation' && iSent}
			<a class="text-sm font-medium text-info hover:underline" href="/confirm/{tip.id}">Confirm</a>
		{:else}
			<StateBadge state={tip.state} />
		{/if}
	</div>
</li>
