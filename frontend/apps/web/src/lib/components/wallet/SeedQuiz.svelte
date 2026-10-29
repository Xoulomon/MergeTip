<script lang="ts">
	import { Button, TextField } from '@mergetip/ui';
	import { passesChallenge, pickChallenge } from '#lib/breez/mnemonic.ts';

	let {
		words,
		onback,
		onpass
	}: { words: readonly string[]; onback: () => void; onpass: () => void } = $props();

	// The positions are fixed when the step opens.
	// svelte-ignore state_referenced_locally
	const positions = pickChallenge(words.length);
	// Every field starts as '' so `bind:value` never sees undefined (TextField has a fallback).
	let answers = $state<Record<number, string>>(Object.fromEntries(positions.map((p) => [p, ''])));
	let error = $state<string | null>(null);

	function check(event: SubmitEvent) {
		event.preventDefault();
		if (passesChallenge(words, answers, positions)) onpass();
		else error = 'One or more words do not match. Check your copy and try again.';
	}
</script>

<form class="flex flex-col gap-4" onsubmit={check} novalidate>
	<p class="text-sm text-fg-muted">To make sure your copy is right, type these words from it.</p>
	{#each positions as position (position)}
		<TextField
			id="seed-word-{position}"
			label="Word #{position + 1}"
			bind:value={answers[position]}
			autocomplete="off"
			autocapitalize="none"
			spellcheck="false"
			oninput={() => (error = null)}
		/>
	{/each}
	{#if error}<p class="text-sm font-medium text-danger" role="alert">{error}</p>{/if}
	<div class="flex gap-2">
		<Button onclick={onback}>Show the words again</Button>
		<Button type="submit" variant="primary">Check words</Button>
	</div>
</form>
