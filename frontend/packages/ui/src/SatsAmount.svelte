<script lang="ts">
	import { formatSats } from './format';

	let { amount, class: extra = '' }: { amount: number; class?: string } = $props();
</script>

<span class="font-semibold whitespace-nowrap tabular-nums {extra}">{formatSats(amount)}</span>
