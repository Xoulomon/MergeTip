<script lang="ts">
	import { PUBLIC_ALBY_HUB_URL } from '$app/env/public';
	import { Button, formatNumber } from '@mergetip/ui';
	import { BUDGET_RENEWALS, albyConnectUrl, type BudgetRenewal } from '#lib/alby.ts';

	let budget = $state(50_000);
	let renewal = $state<BudgetRenewal>('monthly');

	let valid = $derived(Number.isInteger(budget) && budget >= 1 && budget <= 100_000_000);
	let href = $derived(
		valid ? albyConnectUrl({ hubUrl: PUBLIC_ALBY_HUB_URL, budgetSats: budget, renewal }) : undefined
	);
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-fg-muted">
		Create a connection in Alby Hub that can only pay invoices, up to a budget you choose. Alby
		shows a connection string: copy it and paste it above.
	</p>
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="flex flex-col gap-1.5">
			<label for="alby-budget" class="text-sm font-semibold">Budget (sats)</label>
			<input
				id="alby-budget"
				class="mt-input tabular-nums"
				type="number"
				min="1"
				max="100000000"
				step="1"
				bind:value={budget}
				aria-invalid={!valid || undefined}
				aria-describedby="alby-budget-hint"
			/>
			<p id="alby-budget-hint" class="text-xs text-fg-muted">
				{valid ? `${formatNumber(budget)} sats per period` : 'Enter a whole number of sats.'}
			</p>
		</div>
		<div class="flex flex-col gap-1.5">
			<label for="alby-renewal" class="text-sm font-semibold">Budget renews</label>
			<select id="alby-renewal" class="mt-input capitalize" bind:value={renewal}>
				{#each BUDGET_RENEWALS as option (option)}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
	</div>
	<div>
		<Button
			variant="bolt"
			href={href ?? '#'}
			target="_blank"
			rel="noopener noreferrer"
			aria-disabled={!valid || undefined}
		>
			Connect with Alby
		</Button>
	</div>
</div>
