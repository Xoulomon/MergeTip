<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MergeTip</title>
</svelte:head>

{@render children()}
