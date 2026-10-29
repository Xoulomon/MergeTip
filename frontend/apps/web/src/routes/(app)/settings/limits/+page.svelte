<script lang="ts">
	import { ApiError } from '@mergetip/api-client';
	import { Button, Card, toasts } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import LimitsForm from '#lib/components/settings/LimitsForm.svelte';
	import Toggle from '#lib/components/settings/Toggle.svelte';
	import { handleError } from '#lib/run.ts';
	import { session, signIn } from '#lib/session.svelte.ts';

	let savingOtp = $state(false);
	let otpError = $state<string | null>(null);
	let otpNeedsReauth = $state(false);

	let me = $derived(session.me);

	async function setOtp(enabled: boolean) {
		savingOtp = true;
		otpError = null;
		otpNeedsReauth = false;
		try {
			session.set(await api.updateSettings({ confirm_otp_enabled: enabled }));
			toasts.success(enabled ? 'Email codes turned on.' : 'Email codes turned off.');
		} catch (error) {
			otpNeedsReauth = error instanceof ApiError && error.needsReauth;
			otpError = handleError(error);
		} finally {
			savingOtp = false;
		}
	}
</script>

<svelte:head><title>Limits and safety · MergeTip</title></svelte:head>

{#if me}
	<Card
		title="Spending limits"
		description="MergeTip enforces these on every tip, on top of the budget set in your wallet."
	>
		<LimitsForm {me} />
	</Card>

	<Card title="Confirmation codes">
		<Toggle
			id="otp"
			label="Also require an emailed code"
			description={me.email
				? `Confirming a large tip will also need a 6-digit code sent to ${me.email}.`
				: 'Add a verified email address on GitHub and sign in again to use codes.'}
			checked={me.confirm_otp_enabled}
			disabled={savingOtp || (!me.email && !me.confirm_otp_enabled)}
			onchange={setOtp}
		/>
		{#if otpError}
			<p class="mt-3 text-sm font-medium text-danger" role="alert">{otpError}</p>
			{#if otpNeedsReauth}
				<Button class="mt-2" size="sm" onclick={() => signIn()}>Sign in again</Button>
			{/if}
		{/if}
	</Card>
{/if}
