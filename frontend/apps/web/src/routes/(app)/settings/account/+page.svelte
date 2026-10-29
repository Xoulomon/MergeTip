<script lang="ts">
	import { goto } from '$app/navigation';
	import { Avatar, Button, Card, Dialog, TextField } from '@mergetip/ui';
	import { api } from '#lib/api.ts';
	import { run } from '#lib/run.ts';
	import { session } from '#lib/session.svelte.ts';

	let confirming = $state(false);
	let typed = $state('');
	let deleting = $state(false);
	let signingOut = $state(false);

	let me = $derived(session.me);
	let matches = $derived(
		me !== null && typed.trim().toLowerCase() === me.github_login.toLowerCase()
	);

	async function signOut() {
		signingOut = true;
		await run(async () => {
			await api.logout();
			await goto('/');
			session.clear();
		}, 'Signed out.');
		signingOut = false;
	}

	async function deleteAccount(event: SubmitEvent) {
		event.preventDefault();
		if (!matches) return;
		deleting = true;
		await run(async () => {
			await api.deleteAccount();
			confirming = false;
			await goto('/');
			session.clear();
		}, 'Your account was deleted.');
		deleting = false;
	}
</script>

<svelte:head><title>Account · MergeTip</title></svelte:head>

{#if me}
	<Card title="Account">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<Avatar login={me.github_login} src={me.avatar_url} size={48} />
				<div>
					<p class="font-semibold">@{me.github_login}</p>
					<p class="text-sm text-fg-muted">Signed in with GitHub</p>
				</div>
			</div>
			<Button loading={signingOut} onclick={signOut}>Sign out</Button>
		</div>
	</Card>

	<Card title="Delete account">
		<p class="text-sm text-fg-muted">
			This disconnects your wallet, removes your Lightning address and email, and signs you out
			everywhere. Tips still waiting, sent or received, are closed. Past tips stay in GitHub
			threads, with your details removed from our records.
		</p>
		<Button class="mt-4" variant="danger" onclick={() => ((typed = ''), (confirming = true))}>
			Delete my account
		</Button>
	</Card>

	<Dialog
		bind:open={confirming}
		title="Delete your MergeTip account?"
		description="This cannot be undone."
	>
		<form id="delete-account" onsubmit={deleteAccount} novalidate>
			<TextField
				id="confirm-login"
				label="Type {me.github_login} to confirm"
				bind:value={typed}
				autocomplete="off"
				autocapitalize="none"
				spellcheck="false"
			/>
		</form>
		{#snippet footer()}
			<Button onclick={() => (confirming = false)}>Cancel</Button>
			<Button
				type="submit"
				form="delete-account"
				variant="danger"
				disabled={!matches}
				loading={deleting}
			>
				Delete account
			</Button>
		{/snippet}
	</Dialog>
{/if}
