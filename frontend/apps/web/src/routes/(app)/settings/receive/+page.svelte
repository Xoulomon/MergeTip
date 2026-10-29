<script lang="ts">
	import type { Me } from '@mergetip/api-client';
	import { Badge, Button, Card, toasts } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import LightningAddressForm from '#lib/components/settings/LightningAddressForm.svelte';
	import Toggle from '#lib/components/settings/Toggle.svelte';
	import CreateWallet from '#lib/components/wallet/CreateWallet.svelte';
	import { walletAvailable } from '#lib/breez/wallet.ts';
	import { run } from '#lib/run.ts';
	import { session } from '#lib/session.svelte.ts';

	let creating = $state(false);
	let savingOptOut = $state(false);

	let me = $derived(session.me);

	function saved(updated: Me) {
		session.set(updated);
		toasts.success('Lightning address saved. Tips now arrive instantly.');
	}

	async function useNewWallet(address: string) {
		const ok = await run(async () => saved(await api.setLightningAddress(address)));
		if (ok) creating = false;
	}

	async function setOptOut(optOut: boolean) {
		savingOptOut = true;
		await run(
			async () => session.set(await api.updateSettings({ email_opt_out: optOut })),
			optOut ? 'Emails turned off.' : 'Emails turned on.'
		);
		savingOptOut = false;
	}
</script>

<svelte:head><title>Receiving · MergeTip</title></svelte:head>

{#if me}
	<Card
		title="Receive tips"
		description="Tips to @{me.github_login} are paid to this address. Without one, tips wait as pledges for 30 days."
	>
		{#snippet actions()}
			{#if me.lightning_address}<Badge tone="success">Paid instantly</Badge>
			{:else}<Badge tone="bolt">Tips become pledges</Badge>{/if}
		{/snippet}
		{#if creating && walletAvailable}
			<CreateWallet
				login={me.github_login}
				oncreated={useNewWallet}
				oncancel={() => (creating = false)}
			/>
		{:else}
			<LightningAddressForm initial={me.lightning_address ?? ''} onsaved={saved} />
			{#if walletAvailable}
				<div class="mt-4 border-t border-default pt-4 text-sm">
					<p class="text-fg-muted">
						{me.lightning_address
							? 'Want a new wallet instead? Its address replaces the one above.'
							: "Don't have a Lightning address?"}
					</p>
					<Button
						class="mt-2"
						variant={me.lightning_address ? 'default' : 'bolt'}
						onclick={() => (creating = true)}
					>
						Create a wallet in this browser
					</Button>
				</div>
			{/if}
		{/if}
	</Card>

	<Card title="Email notices" headingLevel={2}>
		<Toggle
			id="email-opt-out"
			label="Email me about pledges"
			description={me.email
				? `Claim links and expiry reminders go to ${me.email}, at most once a day. GitHub mentions always happen.`
				: 'We have no email address for you, so you get GitHub mentions only.'}
			checked={!me.email_opt_out}
			disabled={savingOptOut}
			onchange={(on) => setOptOut(!on)}
		/>
	</Card>
{/if}
