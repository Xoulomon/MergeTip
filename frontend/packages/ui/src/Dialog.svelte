<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		description,
		children,
		footer
	}: {
		open?: boolean;
		title: string;
		description?: string;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	const uid = $props.id();

	// The native <dialog> handles focus trapping, Escape and the inert background.
	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	class="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-md border border-default bg-canvas p-0 text-fg shadow-lg backdrop:bg-black/50"
	aria-labelledby="{uid}-title"
	aria-describedby={description ? `${uid}-description` : undefined}
	onclose={() => (open = false)}
>
	<header class="border-b border-default px-4 py-3">
		<h2 id="{uid}-title" class="font-semibold">{title}</h2>
		{#if description}<p id="{uid}-description" class="mt-1 text-sm text-fg-muted">
				{description}
			</p>{/if}
	</header>
	<div class="px-4 py-4">{@render children()}</div>
	{#if footer}
		<footer class="flex flex-wrap justify-end gap-2 border-t border-default px-4 py-3">
			{@render footer()}
		</footer>
	{/if}
</dialog>
