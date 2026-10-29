<script lang="ts">
	import type { Tip } from '@mergetip/api-client';
	import { Alert, Avatar, Button, Card, StateBadge, formatSats } from '@mergetip/ui';
	import ConfirmTip from '#lib/components/confirm/ConfirmTip.svelte';
	import { session } from '#lib/session.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Outcome = { kind: 'confirmed'; tip: Tip } | { kind: 'cancelled' };
	let outcome = $state<Outcome | null>(null);

	let tip = $derived(outcome?.kind === 'confirmed' ? outcome.tip : data.tip);
	let otpRequired = $derived(session.me?.confirm_otp_enabled ?? false);
</script>

<svelte:head><title>Confirm a tip · MergeTip</title></svelte:head>

<div class="mx-auto flex max-w-lg flex-col gap-6">
	<h1 class="text-2xl font-semibold">Confirm a large tip</h1>

	{#if data.problem}
		<Alert
			title={data.problem.code === 'not_sender'
				? 'This is not your tip'
				: 'We could not load this tip'}
			onretry={data.problem.isNetwork ? () => location.reload() : undefined}
		>
			{data.problem.message}
		</Alert>
		<div><Button href="/dashboard">Go to your dashboard</Button></div>
	{:else if tip}
		<Card title="You are about to send">
			{#snippet actions()}<StateBadge state={tip.state} />{/snippet}
			<p class="text-3xl font-semibold text-bolt tabular-nums">{formatSats(tip.amount_sats)}</p>
			<dl class="mt-4 grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
				<dt class="text-fg-muted">To</dt>
				<dd class="flex items-center gap-2">
					<Avatar login={tip.receiver.login} src={tip.receiver.avatar_url || undefined} />
					<a class="font-semibold hover:underline" href="https://github.com/{tip.receiver.login}"
						>@{tip.receiver.login}</a
					>
				</dd>
				<dt class="text-fg-muted">Repository</dt>
				<dd>{tip.repo}</dd>
				<dt class="text-fg-muted">Thread</dt>
				<dd>
					<a class="text-info hover:underline" href={tip.thread_url}>#{tip.thread_number}</a>
					{#if tip.kind === 'on_merge'}<span class="text-fg-muted">· pays on merge</span>{/if}
				</dd>
				{#if tip.note}
					<dt class="text-fg-muted">Note</dt>
					<dd>{tip.note}</dd>
				{/if}
			</dl>
		</Card>

		{#if outcome?.kind === 'cancelled'}
			<Alert tone="info" title="Tip cancelled">Nothing was sent. The thread will be updated.</Alert>
			<div><Button href="/dashboard">Go to your dashboard</Button></div>
		{:else if outcome?.kind === 'confirmed'}
			<Alert tone="success" title="Confirmed">
				{tip.kind === 'on_merge'
					? 'It will be paid when the pull request is merged.'
					: 'Your wallet is paying it now. A receipt will appear in the thread.'}
			</Alert>
			<div><Button href="/dashboard">Go to your dashboard</Button></div>
		{:else if tip.state === 'awaiting_confirmation'}
			<p class="text-sm text-fg-muted">
				This tip is above your {formatSats(session.me?.confirm_threshold_sats ?? 0)} confirmation threshold.
				A GitHub comment alone cannot send it, so only you, signed in here, can.
			</p>
			<ConfirmTip
				{tip}
				{otpRequired}
				ondone={(result) =>
					(outcome = result ? { kind: 'confirmed', tip: result } : { kind: 'cancelled' })}
			/>
		{:else}
			<Alert tone="info" title="Nothing to confirm">This tip no longer needs confirmation.</Alert>
			<div><Button href="/dashboard">Go to your dashboard</Button></div>
		{/if}
	{/if}
</div>
