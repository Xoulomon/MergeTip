<script lang="ts">
	let {
		id,
		label,
		description,
		checked,
		disabled = false,
		onchange
	}: {
		id: string;
		label: string;
		description?: string;
		checked: boolean;
		disabled?: boolean;
		onchange: (checked: boolean) => void;
	} = $props();
</script>

<div class="flex items-start justify-between gap-4">
	<div>
		<label id="{id}-label" for={id} class="text-sm font-semibold">{label}</label>
		{#if description}
			<p id="{id}-description" class="mt-0.5 text-sm text-fg-muted">{description}</p>
		{/if}
	</div>
	<button
		{id}
		type="button"
		role="switch"
		aria-labelledby="{id}-label"
		aria-checked={checked}
		aria-describedby={description ? `${id}-description` : undefined}
		{disabled}
		class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-default transition-colors disabled:opacity-60 {checked
			? 'bg-accent'
			: 'bg-inset'}"
		onclick={() => onchange(!checked)}
	>
		<span
			class="inline-block size-4 rounded-full bg-white shadow-md transition-transform {checked
				? 'translate-x-6'
				: 'translate-x-1'}"
		></span>
	</button>
</div>
