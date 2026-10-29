<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		id,
		label,
		value = $bindable(''),
		hint,
		error,
		prefix,
		trailing,
		...rest
	}: Omit<HTMLInputAttributes, 'value' | 'id' | 'prefix'> & {
		id: string;
		label: string;
		value?: string;
		hint?: string;
		/** Shown under the field and announced; also marks the input invalid. */
		error?: string | null;
		/** Text shown inside the field before the value, e.g. `@`. */
		prefix?: string;
		/** A control on the right of the field, e.g. a show/hide toggle. */
		trailing?: Snippet;
	} = $props();

	let describedBy = $derived(
		[error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') ||
			undefined
	);
</script>

<div class="flex flex-col gap-1.5">
	<label for={id} class="text-sm font-semibold">{label}</label>
	<div class="flex items-center gap-2">
		<div class="relative flex-1">
			{#if prefix}
				<span
					class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-fg-muted"
				>
					{prefix}
				</span>
			{/if}
			<input
				{id}
				class="mt-input {prefix ? 'pl-7' : ''}"
				bind:value
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy}
				{...rest}
			/>
		</div>
		{@render trailing?.()}
	</div>
	{#if error}
		<p id="{id}-error" class="text-xs font-medium text-danger">{error}</p>
	{/if}
	{#if hint}
		<p id="{id}-hint" class="text-xs text-fg-muted">{hint}</p>
	{/if}
</div>
