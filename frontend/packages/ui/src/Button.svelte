<script lang="ts" module>
	export type ButtonVariant = 'default' | 'primary' | 'bolt' | 'danger' | 'invisible';
	export type ButtonSize = 'sm' | 'md' | 'lg';

	const VARIANTS: Record<ButtonVariant, string> = {
		default: 'border-default bg-btn text-fg hover:bg-btn-hover',
		primary: 'border-transparent bg-accent text-on-accent hover:bg-accent-hover',
		bolt: 'border-transparent bg-bolt-emphasis text-on-bolt hover:brightness-110',
		danger:
			'border-default bg-btn text-danger hover:border-transparent hover:bg-danger-emphasis hover:text-white',
		invisible: 'border-transparent bg-transparent text-fg hover:bg-hover'
	};

	const SIZES: Record<ButtonSize, string> = {
		sm: 'h-7 px-3 text-xs',
		md: 'h-8 px-4 text-sm',
		lg: 'h-10 px-5 text-base'
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Spinner from './Spinner.svelte';

	type Common = {
		variant?: ButtonVariant;
		size?: ButtonSize;
		/** Shows a spinner and blocks clicks while an action is in flight. */
		loading?: boolean;
		block?: boolean;
		children: Snippet;
	};

	let {
		variant = 'default',
		size = 'md',
		loading = false,
		block = false,
		children,
		class: extra = '',
		...rest
	}: Common &
		(
			(HTMLButtonAttributes & { href?: never }) | (HTMLAnchorAttributes & { href: string })
		) = $props();

	let classes = $derived(
		[
			'inline-flex items-center justify-center gap-2 rounded-md border font-medium whitespace-nowrap shadow-xs transition-colors select-none',
			'disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60',
			VARIANTS[variant],
			SIZES[size],
			block ? 'w-full' : '',
			extra
		].join(' ')
	);
</script>

{#if 'href' in rest && rest.href !== undefined}
	<a {...rest as HTMLAnchorAttributes} class={classes}>
		{@render children()}
	</a>
{:else}
	<button
		type="button"
		{...rest as HTMLButtonAttributes}
		class={classes}
		disabled={(rest as HTMLButtonAttributes).disabled || loading}
		aria-busy={loading || undefined}
	>
		{#if loading}<Spinner size={14} label="Working" />{/if}
		{@render children()}
	</button>
{/if}
