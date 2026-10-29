<script lang="ts">
	import { Alert, Button } from '@mergetip/ui';
	import { newMnemonic } from '#lib/breez/mnemonic.ts';
	import { seal, storeSealed } from '#lib/breez/vault.ts';
	import { createLightningAddress, usernameCandidates } from '#lib/breez/wallet.ts';
	import PinForm from './PinForm.svelte';
	import SeedQuiz from './SeedQuiz.svelte';
	import SeedWords from './SeedWords.svelte';

	let {
		login,
		oncreated,
		oncancel
	}: {
		/** GitHub login, used to suggest the Lightning address username. */
		login: string;
		/** Receives the new wallet's Lightning address. */
		oncreated: (address: string) => Promise<void> | void;
		oncancel: () => void;
	} = $props();

	type Step = 'words' | 'quiz' | 'pin' | 'failed';
	let step = $state<Step>('words');
	let words = $state(newMnemonic());
	let busy = $state(false);

	const STEPS: Record<Exclude<Step, 'failed'>, string> = {
		words: 'Step 1 of 3: Save your recovery phrase',
		quiz: 'Step 2 of 3: Check your copy',
		pin: 'Step 3 of 3: Lock the wallet'
	};

	async function create(pin: string) {
		busy = true;
		let address: string;
		try {
			const mnemonic = words.join(' ');
			await storeSealed(await seal(mnemonic, pin));
			address = await createLightningAddress(mnemonic, usernameCandidates(login));
		} catch (error) {
			// The SDK can fail to load (old browser, blocked WASM, Breez outage): fall back to pasting.
			console.error('Wallet creation failed', error);
			step = 'failed';
			busy = false;
			return;
		}
		// The wallet exists now; the parent reports any problem saving its address.
		try {
			await oncreated(address);
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex flex-col gap-4" aria-live="polite">
	{#if step === 'failed'}
		<Alert title="We couldn't create a wallet in this browser">
			Paste a Lightning address instead. Any Lightning wallet can give you one, for example Alby,
			Wallet of Satoshi or Phoenix.
		</Alert>
		<div><Button onclick={oncancel}>Paste a Lightning address instead</Button></div>
	{:else}
		<p class="text-xs font-semibold text-fg-muted">{STEPS[step]}</p>
		{#if step === 'words'}
			<SeedWords {words} oncontinue={() => (step = 'quiz')} />
		{:else if step === 'quiz'}
			<SeedQuiz {words} onback={() => (step = 'words')} onpass={() => (step = 'pin')} />
		{:else}
			<PinForm {busy} onsubmit={create} />
		{/if}
		{#if !busy}
			<button
				type="button"
				class="self-start text-sm text-fg-muted underline hover:text-fg"
				onclick={() => ((words = newMnemonic()), oncancel())}
			>
				Cancel and paste an address instead
			</button>
		{/if}
	{/if}
</div>
