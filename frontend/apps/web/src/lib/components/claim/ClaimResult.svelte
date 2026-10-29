<script lang="ts">
	import type { Tip } from '@mergetip/api-client';
	import { Alert, Button, Spinner, formatSats, truncateMiddle } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { pollUntil } from '#lib/poll.ts';

	let { token, initial }: { token: string; initial: Tip } = $props();

	// svelte-ignore state_referenced_locally
	let tip = $state(initial);
	let checking = $state(false);
	let gaveUp = $state(false);

	const SETTLED = new Set(['paid', 'failed', 'cancelled', 'expired', 'rejected']);

	// The payment runs in the background: check back, slowing down, until it settles.
	async function follow(signal?: AbortSignal) {
		checking = true;
		gaveUp = false;
		const latest = await pollUntil(
			() => api.claim(token),
			(value) => SETTLED.has(value.state),
			signal ? { signal } : {}
		);
		if (signal?.aborted) return;
		if (latest) tip = latest;
		checking = false;
		gaveUp = !SETTLED.has(tip.state);
	}

	$effect(() => {
		const controller = new AbortController();
		void follow(controller.signal);
		return () => controller.abort();
	});
</script>

<div class="flex flex-col items-center gap-4 text-center" aria-live="polite">
	{#if tip.state === 'paid'}
		<p class="text-5xl" aria-hidden="true">⚡</p>
		<h2 class="text-xl font-semibold">{formatSats(tip.amount_sats)} received</h2>
		<p class="text-sm text-fg-muted">
			The sats are in your wallet, and a receipt was posted on
			<a class="text-info underline" href={tip.thread_url}>{tip.repo}#{tip.thread_number}</a>.
		</p>
		{#if tip.payment_hash}
			<p class="font-mono text-xs text-fg-muted" title={tip.payment_hash}>
				Payment {truncateMiddle(tip.payment_hash, 10, 6)}
			</p>
		{/if}
		<Button href="/dashboard">Go to your dashboard</Button>
	{:else if SETTLED.has(tip.state)}
		<Alert title="The payment didn't go through">
			@{tip.sender.login}'s wallet could not pay this tip. The thread on
			<a class="underline" href={tip.thread_url}>{tip.repo}#{tip.thread_number}</a> has the details.
		</Alert>
	{:else if gaveUp}
		<h2 class="text-xl font-semibold">Your sats are on their way</h2>
		<p class="text-sm text-fg-muted">
			@{tip.sender.login}'s wallet is taking longer than usual. MergeTip keeps trying, and a receipt
			will appear on
			<a class="text-info underline" href={tip.thread_url}>{tip.repo}#{tip.thread_number}</a> once it
			is paid.
		</p>
		<Button loading={checking} onclick={() => follow()}>Check again</Button>
	{:else}
		<Spinner size={28} label="Paying" />
		<h2 class="text-xl font-semibold">Sending your sats…</h2>
		<p class="text-sm text-fg-muted">
			@{tip.sender.login}'s wallet is paying you now. This usually takes a few seconds.
		</p>
	{/if}
</div>
