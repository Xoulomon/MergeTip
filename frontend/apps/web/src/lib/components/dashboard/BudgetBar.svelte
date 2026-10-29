<script lang="ts">
	import { formatNumber, formatSats } from '@mergetip/ui';

	let { spent, max }: { spent: number; max: number } = $props();

	let remaining = $derived(Math.max(0, max - spent));
	let ratio = $derived(max > 0 ? spent / max : 1);
	let tone = $derived(
		ratio >= 1
			? '[&::-moz-progress-bar]:bg-danger [&::-webkit-progress-value]:bg-danger'
			: ratio >= 0.8
				? '[&::-moz-progress-bar]:bg-warning [&::-webkit-progress-value]:bg-warning'
				: '[&::-moz-progress-bar]:bg-accent [&::-webkit-progress-value]:bg-accent'
	);
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-wrap items-baseline justify-between gap-2 text-sm">
		<span id="budget-label" class="font-semibold">Today's budget</span>
		<span class="text-fg-muted tabular-nums">
			{formatNumber(spent)} / {formatSats(max)} used
		</span>
	</div>
	<progress
		class="h-2 w-full appearance-none overflow-hidden rounded-full bg-inset [&::-webkit-progress-bar]:bg-inset {tone}"
		value={Math.min(spent, max)}
		{max}
		aria-labelledby="budget-label"
		aria-valuetext="{formatSats(spent)} of {formatSats(max)} used today"
	></progress>
	<p class="text-xs text-fg-muted">
		{remaining > 0
			? `${formatSats(remaining)} left today. The limit resets at midnight UTC.`
			: 'Daily limit reached. New tips wait until tomorrow.'}
		<a class="text-info underline" href="/settings/limits">Change limits</a>
	</p>
</div>
