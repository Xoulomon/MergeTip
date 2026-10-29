<script lang="ts">
	import { Alert, Button } from '@mergetip/ui';

	let { words, oncontinue }: { words: readonly string[]; oncontinue: () => void } = $props();

	let saved = $state(false);
</script>

<div class="flex flex-col gap-4">
	<Alert tone="warning" title="Write these 12 words down, in order">
		They are the only way to recover your sats if this browser's data is cleared. Anyone with them
		can spend your sats, so keep them private. MergeTip never sees them.
	</Alert>
	<ol class="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Recovery phrase">
		{#each words as word, index (index)}
			<li
				class="flex items-baseline gap-2 rounded-md border border-default bg-subtle px-3 py-2 font-mono text-sm"
			>
				<span class="w-5 text-right text-xs text-fg-muted tabular-nums">{index + 1}</span>
				<span>{word}</span>
			</li>
		{/each}
	</ol>
	<label class="flex items-center gap-2 text-sm">
		<input type="checkbox" class="size-4 accent-accent" bind:checked={saved} />
		I have written down all 12 words
	</label>
	<div>
		<Button variant="primary" disabled={!saved} onclick={oncontinue}>Continue</Button>
	</div>
</div>
