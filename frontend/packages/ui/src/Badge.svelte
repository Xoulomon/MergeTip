<script lang="ts" module>
	import type { Tone } from './format';

	const TONES: Record<Tone, string> = {
		neutral: 'border-default text-fg-muted',
		success: 'border-success text-success bg-success-subtle',
		warning: 'border-warning text-warning bg-warning-subtle',
		danger: 'border-danger text-danger bg-danger-subtle',
		info: 'border-info text-info bg-info-subtle',
		bolt: 'border-bolt text-bolt bg-bolt-subtle'
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tone = 'neutral', children }: { tone?: Tone; children: Snippet } = $props();
</script>

<span
	class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs leading-4 font-medium whitespace-nowrap {TONES[
		tone
	]}"
>
	{@render children()}
</span>
