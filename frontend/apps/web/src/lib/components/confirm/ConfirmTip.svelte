<script lang="ts">
	import { ApiError, firstIssue, schemas, type Tip } from '@mergetip/api-client';
	import { Alert, Button, formatCountdown, toasts } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { Clock } from '#lib/clock.svelte.ts';
	import { handleError } from '#lib/run.ts';
	import OtpField from './OtpField.svelte';

	let {
		tip,
		otpRequired,
		ondone
	}: { tip: Tip; otpRequired: boolean; ondone: (tip: Tip | null) => void } = $props();

	const clock = new Clock();
	let left = $derived(tip.expires_at ? Date.parse(tip.expires_at) - clock.now : 0);
	let expired = $derived(left <= 0);

	let otp = $state('');
	let codeSent = $state(false);
	let busy = $state<'send' | 'confirm' | 'cancel' | null>(null);
	let error = $state<string | null>(null);
	let otpError = $state<string | null>(null);

	async function act(kind: 'send' | 'confirm' | 'cancel', task: () => Promise<void>) {
		busy = kind;
		error = null;
		otpError = null;
		try {
			await task();
		} catch (cause) {
			const message = handleError(cause);
			if (cause instanceof ApiError && cause.code === 'otp_invalid') otpError = message;
			else error = message;
		} finally {
			busy = null;
		}
	}

	const sendCode = () =>
		act('send', async () => {
			await api.sendConfirmationCode(tip.id);
			codeSent = true;
			toasts.success('Code sent. Check your email.');
		});

	const confirm = () =>
		act('confirm', async () => {
			if (otpRequired) {
				otpError = firstIssue(schemas.otp, otp);
				if (otpError) return;
			}
			ondone(await api.confirm(tip.id, otpRequired ? otp : undefined));
		});

	const cancel = () =>
		act('cancel', async () => {
			await api.cancelConfirmation(tip.id);
			ondone(null);
		});
</script>

<div class="flex flex-col gap-4">
	<p class="text-center text-sm {expired ? 'font-semibold text-danger' : 'text-fg-muted'}">
		{#if expired}
			The confirmation window has closed, so this tip was cancelled.
		{:else}
			Confirm within <strong class="text-fg tabular-nums">{formatCountdown(left)}</strong>, or it is
			cancelled.
		{/if}
	</p>

	{#if error}<Alert>{error}</Alert>{/if}

	{#if otpRequired && !expired}
		<div class="flex flex-wrap items-end gap-3">
			<OtpField bind:value={otp} error={otpError} disabled={!codeSent} />
			<Button loading={busy === 'send'} onclick={sendCode}>
				{codeSent ? 'Send a new code' : 'Email me a code'}
			</Button>
		</div>
	{/if}

	<div class="flex flex-wrap gap-2">
		<Button
			variant="primary"
			size="lg"
			disabled={expired || (otpRequired && otp.length === 0) || busy !== null}
			loading={busy === 'confirm'}
			onclick={confirm}
		>
			Confirm and send
		</Button>
		<Button
			variant="danger"
			size="lg"
			disabled={expired || busy !== null}
			loading={busy === 'cancel'}
			onclick={cancel}
		>
			Cancel tip
		</Button>
	</div>
</div>
