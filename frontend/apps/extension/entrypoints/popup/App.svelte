<script lang="ts">
	import { Button } from '@mergetip/ui';

	// Quick amounts from FR-8.2.
	const amounts = [21, 210, 2100];
</script>

<main>
	<h1>⚡ MergeTip</h1>
	{#each amounts as amount (amount)}
		<Button>{amount.toLocaleString('en-US')}</Button>
	{/each}
</main>

<style>
	main {
		width: 320px;
		padding: 12px;
		font-family: var(--mt-font);
		background: var(--mt-bg);
		color: var(--mt-fg);
	}
</style>
