<script lang="ts">
	import { firstIssue, schemas, type Me, type Tip } from '@mergetip/api-client';
	import { Alert, Button, TextField } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { walletAvailable } from '#lib/breez/wallet.ts';
	import CreateWallet from '#lib/components/wallet/CreateWallet.svelte';
	import { handleError } from '#lib/run.ts';
	import { session } from '#lib/session.svelte.ts';

	let { token, me, onclaimed }: { token: string; me: Me; onclaimed: (tip: Tip) => void } = $props();

	type Mode = 'saved' | 'paste' | 'create';
	// svelte-ignore state_referenced_locally
	let mode = $state<Mode>(me.lightning_address ? 'saved' : 'paste');
	let address = $state('');
	let touched = $state(false);
	let busy = $state(false);
	let error = $state<string | null>(null);

	let fieldError = $derived(touched ? firstIssue(schemas.lightningAddress, address) : null);

	async function claim(to?: string) {
		busy = true;
		error = null;
		try {
			onclaimed(await api.submitClaim(token, to));
		} catch (cause) {
			error = handleError(cause);
		} finally {
			busy = false;
		}
	}

	function claimToPasted(event: SubmitEvent) {
		event.preventDefault();
		touched = true;
		const parsed = schemas.lightningAddress.safeParse(address);
		if (parsed.success) void claim(parsed.data);
	}

	async function claimToNewWallet(newAddress: string) {
		try {
			// Link the new wallet to this GitHub account (FR-7.3), then claim to it.
			session.set(await api.setLightningAddress(newAddress));
		} catch (cause) {
			error = handleError(cause);
			return;
		}
		await claim();
	}
</script>

<div class="flex flex-col gap-4">
	{#if error}<Alert>{error}</Alert>{/if}

	{#if mode === 'saved' && me.lightning_address}
		<Button size="lg" variant="primary" block loading={busy} onclick={() => claim()}>
			Claim to {me.lightning_address}
		</Button>
		<Button variant="invisible" onclick={() => (mode = 'paste')}>Use a different address</Button>
	{:else if mode === 'create'}
		<CreateWallet
			login={me.github_login}
			oncreated={claimToNewWallet}
			oncancel={() => (mode = 'paste')}
		/>
	{:else}
		<form class="flex flex-col gap-3" onsubmit={claimToPasted} novalidate>
			<TextField
				id="claim-address"
				label="Your Lightning address"
				type="email"
				inputmode="email"
				bind:value={address}
				placeholder="you@getalby.com"
				autocomplete="off"
				spellcheck="false"
				error={fieldError}
				hint="We check it works before sending. It is also saved for future tips."
				onblur={() => (touched = address.length > 0)}
			/>
			<Button type="submit" size="lg" variant="primary" block loading={busy}>Claim sats</Button>
		</form>
		{#if walletAvailable}
			<div class="flex items-center gap-3 text-xs text-fg-muted">
				<span class="h-px flex-1 bg-default"></span>or<span class="h-px flex-1 bg-default"></span>
			</div>
			<Button size="lg" variant="bolt" block onclick={() => (mode = 'create')}>
				Create a wallet in this browser
			</Button>
			<p class="text-center text-xs text-fg-muted">
				No app needed. Takes about a minute; you keep the keys.
			</p>
		{/if}
	{/if}
</div>
