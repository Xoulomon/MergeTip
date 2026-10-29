<script lang="ts" module>
	export type AvatarSize = 20 | 32 | 48 | 64;

	const SIZES: Record<AvatarSize, string> = {
		20: 'size-5 text-[10px]',
		32: 'size-8 text-sm',
		48: 'size-12 text-lg',
		64: 'size-16 text-2xl'
	};
</script>

<script lang="ts">
	let {
		login,
		src,
		size = 20
	}: {
		login: string;
		/** Defaults to GitHub's avatar for the login. */
		src?: string;
		size?: AvatarSize;
	} = $props();

	let failed = $state(false);
	let url = $derived(
		src ?? `https://avatars.githubusercontent.com/${encodeURIComponent(login)}?size=${size * 2}`
	);
</script>

{#if failed}
	<span
		class="inline-flex shrink-0 items-center justify-center rounded-full bg-subtle font-semibold text-fg-muted uppercase {SIZES[
			size
		]}"
		aria-hidden="true">{login.slice(0, 1)}</span
	>
{:else}
	<img
		class="shrink-0 rounded-full border border-muted bg-subtle {SIZES[size]}"
		src={url}
		alt=""
		width={size}
		height={size}
		loading="lazy"
		onerror={() => (failed = true)}
	/>
{/if}
