<script lang="ts">
	import Badge from './Badge.svelte';
	import { stateLabel, stateTone, type TipStateName } from './format';

	let { state }: { state: TipStateName } = $props();
</script>

<Badge tone={stateTone(state)}>{stateLabel(state)}</Badge>
