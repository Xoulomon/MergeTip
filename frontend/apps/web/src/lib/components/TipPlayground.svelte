<script lang="ts">
	import { formatSats } from '@mergetip/ui';
	import { parseTipLine } from '#lib/tip-command.ts';

	const EXAMPLES = [
		'/tip @reviewer 2100 for the thorough review',
		'/tip @newdev 5k on-merge',
		'/tip @alice 500 @bob 500'
	];

	let line = $state(EXAMPLES[0] ?? '');
	let result = $derived(parseTipLine(line));
</script>

<div class="rounded-md border border-default">
	<div class="border-b border-default bg-subtle px-4 py-3">
		<label for="playground" class="text-sm font-semibold">Try the command</label>
		<p class="text-xs text-fg-muted">Type a comment as you would on a pull request.</p>
	</div>
	<div class="flex flex-col gap-3 p-4">
		<input
			id="playground"
			class="mt-input font-mono"
			bind:value={line}
			spellcheck="false"
			autocomplete="off"
			aria-describedby="playground-result"
		/>
		<div class="flex flex-wrap gap-2">
			{#each EXAMPLES as example (example)}
				<button
					type="button"
					class="rounded-full border border-default px-2.5 py-0.5 font-mono text-xs text-fg-muted hover:bg-hover hover:text-fg"
					onclick={() => (line = example)}>{example}</button
				>
			{/each}
		</div>

		<div
			id="playground-result"
			aria-live="polite"
			class="rounded-md border border-default bg-subtle p-3 text-sm"
		>
			<p class="mb-1 flex items-center gap-1.5 text-xs font-semibold text-fg-muted">
				<span aria-hidden="true">⚡</span> mergetip <span class="font-normal">bot replies</span>
			</p>
			{#if result.ok}
				{@const { receiver, amountSats, onMerge, note } = result.command}
				{#if onMerge}
					<p>
						⏳ @you will tip @{receiver} <strong>{formatSats(amountSats)}</strong> when this PR is merged
					</p>
				{:else}
					<p>
						⚡ @you tipped @{receiver} <strong>{formatSats(amountSats)}</strong>{note
							? ` for ${note}`
							: ''}
						· payment <code class="font-mono text-xs">a1b2…</code>
					</p>
				{/if}
				<p class="mt-2 text-xs text-fg-muted">
					MergeTip first checks that @{receiver} actually contributed to the thread. Without a Lightning
					address they get a claim link instead, and nothing leaves your wallet until they claim.
				</p>
			{:else}
				<p>😕 That command can't be sent. {result.help.replaceAll('`', '')}</p>
			{/if}
		</div>
	</div>
</div>
