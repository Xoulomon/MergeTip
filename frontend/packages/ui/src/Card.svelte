<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		headingLevel = 2,
		actions,
		children,
		class: extra = ''
	}: {
		title?: string;
		description?: string;
		headingLevel?: 2 | 3;
		/** Rendered on the right of the header, e.g. a status badge. */
		actions?: Snippet;
		children: Snippet;
		class?: string;
	} = $props();
</script>

<section class="rounded-md border border-default bg-canvas {extra}">
	{#if title}
		<header
			class="flex flex-wrap items-start justify-between gap-3 border-b border-default bg-subtle px-4 py-3"
		>
			<div class="min-w-0">
				<svelte:element this={`h${headingLevel}`} class="text-sm font-semibold"
					>{title}</svelte:element
				>
				{#if description}<p class="mt-0.5 text-sm text-fg-muted">{description}</p>{/if}
			</div>
			{@render actions?.()}
		</header>
	{/if}
	<div class="p-4">
		{@render children()}
	</div>
</section>
