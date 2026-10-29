<script lang="ts">
	import {
		MAX_NOTE_CHARS,
		firstIssue,
		schemas,
		type Me,
		type ReceiveStatus,
		type TipKind
	} from '@mergetip/api-client';
	import { Alert, Avatar, Badge, Button, formatNumber, formatSats } from '@mergetip/ui';
	import { WEB_URL } from '../lib/config';
	import type { Thread } from '../lib/github';
	import { BackgroundError, ask } from '../lib/messages';

	let { me, thread, receiver }: { me: Me; thread: Thread; receiver: string } = $props();

	const PRESETS = [21, 210, 2100] as const;

	let preset = $state<number | 'custom'>(2100);
	let custom = $state('');
	let kind = $state<TipKind>('now');
	let note = $state('');
	let status = $state<ReceiveStatus['method'] | 'unknown' | null>(null);
	let sending = $state(false);
	let error = $state<string | null>(null);
	let commentUrl = $state<string | null>(null);

	let amount = $derived(preset === 'custom' ? Number(custom) : preset);
	let remaining = $derived(Math.max(0, me.caps.daily_max_sats - me.caps.spent_today_sats));
	let isSelf = $derived(receiver.toLowerCase() === me.github_login.toLowerCase());
	let amountError = $derived.by(() => {
		if (preset === 'custom' && custom === '') return null;
		if (!Number.isInteger(amount) || amount < 1) return 'Enter a whole number of sats.';
		if (amount > me.caps.per_tip_max_sats)
			return `Your limit is ${formatSats(me.caps.per_tip_max_sats)} per tip.`;
		return null;
	});

	$effect(() => {
		const login = receiver;
		status = null;
		ask({ type: 'receive-status', login })
			.then((result) => (status = result.method))
			.catch(() => (status = 'unknown'));
	});

	async function send(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		const body = {
			repo: thread.repo,
			thread_number: thread.number,
			receiver,
			amount_sats: amount,
			kind: thread.isPullRequest ? kind : 'now',
			...(note.trim() ? { note: note.trim() } : {})
		};
		const problem = amountError ?? firstIssue(schemas.tipComment, body);
		if (problem) return void (error = problem);
		sending = true;
		try {
			commentUrl = (await ask({ type: 'post-tip', body })).comment_url;
		} catch (cause) {
			error = cause instanceof BackgroundError ? cause.message : 'The tip could not be posted.';
		} finally {
			sending = false;
		}
	}
</script>

{#if commentUrl}
	<div class="flex flex-col gap-3" role="status">
		<p class="font-semibold">⚡ Tip posted</p>
		<p class="text-sm text-fg-muted">
			MergeTip checks @{receiver}'s work, then pays from your wallet and replies in the thread.
		</p>
		{#if amount > me.confirm_threshold_sats}
			<Alert tone="warning">
				This tip is above your confirmation threshold. Confirm it on your
				<a class="underline" href="{WEB_URL}/dashboard" target="_blank" rel="noopener"
					>MergeTip dashboard</a
				>
				within 1 hour.
			</Alert>
		{/if}
		<Button href={commentUrl} target="_blank" rel="noopener" variant="primary">View comment</Button>
	</div>
{:else}
	<form class="flex flex-col gap-4" onsubmit={send} novalidate>
		<div class="flex items-center gap-3">
			<Avatar login={receiver} size={32} />
			<div class="min-w-0">
				<p class="truncate font-semibold">@{receiver}</p>
				<p class="text-xs text-fg-muted">{thread.repo}#{thread.number}</p>
			</div>
			<span class="ml-auto">
				{#if status === 'lightning_address'}<Badge tone="success">Paid instantly</Badge>
				{:else if status === 'none'}<Badge tone="bolt">Will be pledged</Badge>{/if}
			</span>
		</div>

		{#if isSelf}
			<Alert tone="warning">You can't tip yourself.</Alert>
		{:else}
			<fieldset class="flex flex-col gap-2">
				<legend class="mb-2 text-sm font-semibold">Amount</legend>
				<div class="grid grid-cols-4 gap-2">
					{#each PRESETS as value (value)}
						<label
							class="flex cursor-pointer items-center justify-center rounded-md border border-default py-1.5 text-sm tabular-nums has-checked:border-bolt has-checked:bg-bolt-subtle has-focus-visible:outline-2 has-focus-visible:outline-focus"
						>
							<input class="sr-only" type="radio" name="amount" {value} bind:group={preset} />
							{formatNumber(value)}
						</label>
					{/each}
					<label
						class="flex cursor-pointer items-center justify-center rounded-md border border-default py-1.5 text-sm has-checked:border-bolt has-checked:bg-bolt-subtle has-focus-visible:outline-2 has-focus-visible:outline-focus"
					>
						<input class="sr-only" type="radio" name="amount" value="custom" bind:group={preset} />
						Custom
					</label>
				</div>
				{#if preset === 'custom'}
					<label class="sr-only" for="custom-amount">Custom amount in sats</label>
					<input
						id="custom-amount"
						class="mt-input tabular-nums"
						type="number"
						inputmode="numeric"
						min="1"
						step="1"
						placeholder="Sats"
						bind:value={custom}
					/>
				{/if}
				{#if amountError}<p class="text-xs font-medium text-danger">{amountError}</p>{/if}
			</fieldset>

			{#if thread.isPullRequest}
				<fieldset class="flex gap-4 text-sm">
					<legend class="mb-2 text-sm font-semibold">When</legend>
					<label class="flex items-center gap-2">
						<input type="radio" name="kind" value="now" class="accent-accent" bind:group={kind} /> Now
					</label>
					<label class="flex items-center gap-2">
						<input
							type="radio"
							name="kind"
							value="on_merge"
							class="accent-accent"
							bind:group={kind}
						/>
						When merged
					</label>
				</fieldset>
			{/if}

			<div class="flex flex-col gap-1.5">
				<label for="tip-note" class="text-sm font-semibold"
					>Note <span class="font-normal text-fg-muted">(public)</span></label
				>
				<textarea
					id="tip-note"
					class="mt-input resize-none"
					rows="2"
					maxlength={MAX_NOTE_CHARS}
					placeholder="for the review"
					bind:value={note}></textarea>
				<p class="text-right text-xs text-fg-muted tabular-nums">{note.length}/{MAX_NOTE_CHARS}</p>
			</div>

			<p class="text-xs text-fg-muted tabular-nums">
				Today: {formatNumber(me.caps.spent_today_sats)} / {formatSats(me.caps.daily_max_sats)}
			</p>
			{#if amount > remaining && !amountError}
				<Alert tone="warning"
					>This is more than the {formatSats(remaining)} left in today's limit.</Alert
				>
			{:else if amount > me.confirm_threshold_sats && !amountError}
				<Alert tone="info">You'll confirm this tip in MergeTip before it is sent.</Alert>
			{/if}
			{#if error}<Alert>{error}</Alert>{/if}

			<Button type="submit" variant="bolt" block loading={sending} disabled={!!amountError}>
				Send ⚡ {Number.isInteger(amount) && amount > 0 ? formatSats(amount) : ''}
			</Button>
		{/if}
	</form>
{/if}
