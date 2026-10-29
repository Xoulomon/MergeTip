<script lang="ts">
	import { toasts } from './toast.svelte';

	const TONES = {
		success: 'border-success',
		danger: 'border-danger',
		info: 'border-info'
	} as const;
</script>

<!-- Polite live region: screen readers announce each toast without stealing focus. -->
<div
	class="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto"
	role="status"
	aria-live="polite"
>
	{#each toasts.items as toast (toast.id)}
		<div
			class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border border-l-4 bg-canvas px-4 py-3 text-sm shadow-lg {TONES[
				toast.tone
			]}"
		>
			<p class="flex-1">{toast.message}</p>
			<button
				type="button"
				class="rounded text-fg-muted hover:text-fg"
				aria-label="Dismiss"
				onclick={() => toasts.dismiss(toast.id)}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
					<path
						d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>
