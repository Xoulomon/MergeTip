<script lang="ts">
	import type { Me } from '@mergetip/api-client';
	import { onMount } from 'svelte';
	import { Alert, Button, Spinner } from '@mergetip/ui';
	import type { Thread } from '../lib/github';
	import { BackgroundError, ask } from '../lib/messages';
	import TipForm from './TipForm.svelte';

	let { thread, receiver, onclose }: { thread: Thread; receiver: string; onclose: () => void } =
		$props();

	let view = $state<
		| { kind: 'loading' }
		| { kind: 'signed-out' }
		| { kind: 'ready'; me: Me }
		| { kind: 'error'; message: string }
	>({ kind: 'loading' });
	let panel: HTMLElement | undefined = $state();

	async function load() {
		view = { kind: 'loading' };
		try {
			const status = await ask({ type: 'status' });
			view = status.connected ? { kind: 'ready', me: status.me } : { kind: 'signed-out' };
		} catch (error) {
			view = {
				kind: 'error',
				message: error instanceof BackgroundError ? error.message : 'Could not reach MergeTip.'
			};
		}
	}

	onMount(() => {
		panel?.focus();
		void load();
	});
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onclose()} />

<div class="fixed inset-0 bg-black/40" aria-hidden="true" onclick={onclose}></div>
<div
	bind:this={panel}
	class="fixed top-16 right-4 left-4 mx-auto flex max-w-sm flex-col gap-4 rounded-md border border-default bg-canvas p-4 font-sans text-fg shadow-lg sm:left-auto"
	role="dialog"
	aria-modal="true"
	aria-labelledby="mergetip-title"
	tabindex="-1"
>
	<header class="flex items-center gap-2">
		<span class="text-bolt" aria-hidden="true">⚡</span>
		<h2 id="mergetip-title" class="font-semibold">Tip @{receiver}</h2>
		<button
			type="button"
			class="ml-auto rounded-md p-1 text-fg-muted hover:bg-hover hover:text-fg"
			aria-label="Close"
			onclick={onclose}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
				<path
					d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
				/>
			</svg>
		</button>
	</header>

	{#if view.kind === 'loading'}
		<p class="flex items-center gap-2 text-sm text-fg-muted"><Spinner /> Loading…</p>
	{:else if view.kind === 'signed-out'}
		<p class="text-sm text-fg-muted">Connect the extension to your MergeTip account first.</p>
		<Button variant="primary" onclick={() => ask({ type: 'open-connect' })}>Connect MergeTip</Button
		>
	{:else if view.kind === 'error'}
		<Alert onretry={load}>{view.message}</Alert>
	{:else}
		<TipForm me={view.me} {thread} {receiver} />
	{/if}
</div>
