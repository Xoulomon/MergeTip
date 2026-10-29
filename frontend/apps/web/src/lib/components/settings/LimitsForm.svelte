<script lang="ts">
	import { ApiError, schemas, type Me, type SettingsRequest } from '@mergetip/api-client';
	import { Alert, Button, formatNumber, toasts } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { handleError } from '#lib/run.ts';
	import { session, signIn } from '#lib/session.svelte.ts';

	let { me }: { me: Me } = $props();

	type Field = keyof schemas.Limits;
	const FIELDS: { key: Field; label: string; help: string }[] = [
		{
			key: 'per_tip_max_sats',
			label: 'Most per tip',
			help: 'A single tip above this is refused, whatever the command says.'
		},
		{
			key: 'daily_max_sats',
			label: 'Most per day',
			help: 'Tips stop for the rest of the day once you reach this. Your wallet budget applies on top.'
		},
		{
			key: 'confirm_threshold_sats',
			label: 'Confirm tips above',
			help: 'Larger tips wait for you to confirm them here, so a hijacked GitHub account alone cannot send them. At least 1,000 sats.'
		}
	];

	// Editable copies of the saved values.
	// svelte-ignore state_referenced_locally
	let values = $state<schemas.Limits>({
		per_tip_max_sats: me.caps.per_tip_max_sats,
		daily_max_sats: me.caps.daily_max_sats,
		confirm_threshold_sats: me.confirm_threshold_sats
	});
	let errors = $state<Partial<Record<Field, string>>>({});
	let formError = $state<string | null>(null);
	let needsReauth = $state(false);
	let saving = $state(false);

	function changes(saved: Me): SettingsRequest {
		const current = {
			per_tip_max_sats: saved.caps.per_tip_max_sats,
			daily_max_sats: saved.caps.daily_max_sats,
			confirm_threshold_sats: saved.confirm_threshold_sats
		};
		return Object.fromEntries(
			Object.entries(values).filter(([key, value]) => current[key as Field] !== value)
		);
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		const parsed = schemas.limits.safeParse(values);
		errors = {};
		formError = null;
		needsReauth = false;
		if (!parsed.success) {
			for (const issue of parsed.error.issues) errors[issue.path[0] as Field] ??= issue.message;
			return;
		}
		const body = changes(me);
		if (Object.keys(body).length === 0) return toasts.info('Nothing to save.');
		saving = true;
		try {
			session.set(await api.updateSettings(body));
			toasts.success('Limits saved.');
		} catch (error) {
			needsReauth = error instanceof ApiError && error.needsReauth;
			formError = handleError(error);
		} finally {
			saving = false;
		}
	}
</script>

<form class="flex flex-col gap-5" onsubmit={save} novalidate>
	{#each FIELDS as field (field.key)}
		<div class="flex flex-col gap-1.5">
			<label for={field.key} class="text-sm font-semibold">{field.label}</label>
			<div class="flex items-center gap-2">
				<input
					id={field.key}
					class="mt-input max-w-48 tabular-nums"
					type="number"
					inputmode="numeric"
					min="1"
					step="1"
					bind:value={values[field.key]}
					aria-invalid={errors[field.key] ? true : undefined}
					aria-describedby="{field.key}-help{errors[field.key] ? ` ${field.key}-error` : ''}"
				/>
				<span class="text-sm text-fg-muted">sats</span>
			</div>
			{#if errors[field.key]}
				<p id="{field.key}-error" class="text-xs font-medium text-danger">{errors[field.key]}</p>
			{/if}
			<p id="{field.key}-help" class="text-xs text-fg-muted">{field.help}</p>
		</div>
	{/each}

	{#if formError}
		<Alert tone={needsReauth ? 'warning' : 'danger'}>
			{formError}
			{#if needsReauth}
				<Button class="mt-2" size="sm" onclick={() => signIn()}>Sign in again</Button>
			{/if}
		</Alert>
	{/if}

	<p class="text-xs text-fg-muted">
		Lowering a limit takes effect at once. Raising one asks you to have signed in within the last 15
		minutes. Today you have sent {formatNumber(me.caps.spent_today_sats)} sats.
	</p>
	<div><Button type="submit" variant="primary" loading={saving}>Save limits</Button></div>
</form>
