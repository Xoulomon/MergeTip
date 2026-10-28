<script lang="ts">
	import { Modal, Button, Badge } from '@mergetip/ui';

	let {
		open = false,
		onclose,
		onlogin
	}: {
		open: boolean;
		onclose: () => void;
		onlogin: (handle: string, name?: string, avatar?: string) => void;
	} = $props();

	let handleInput = $state('');
	let nameInput = $state('');
	let tokenInput = $state('');
	let connecting = $state(false);
	let errorMessage = $state<string | null>(null);

	const demoAccounts = [
		{ handle: 'xoulomon', name: 'Xoulomon', role: 'Core Maintainer' },
		{ handle: 'alicesmith', name: 'Alice Smith', role: 'PR Reviewer' },
		{ handle: 'bob-builder', name: 'Bob Builder', role: 'Rust Contributor' },
		{ handle: 'carol-crypto', name: 'Carol Crypto', role: 'Nostr Dev' }
	];

	let cleanHandle = $derived(handleInput.replace(/^@/, '').trim());
	let previewAvatar = $derived(cleanHandle ? `https://github.com/${cleanHandle}.png` : '');

	function selectPreset(preset: { handle: string; name: string }) {
		handleInput = preset.handle;
		nameInput = preset.name;
		errorMessage = null;
	}

	function handleSubmit() {
		if (!cleanHandle) {
			errorMessage = 'Please enter a valid GitHub username.';
			return;
		}

		connecting = true;
		errorMessage = null;

		setTimeout(() => {
			connecting = false;
			onlogin(cleanHandle, nameInput || cleanHandle, previewAvatar);
			handleInput = '';
			nameInput = '';
			tokenInput = '';
			onclose();
		}, 450);
	}
</script>

<Modal
	{open}
	title="Connect GitHub Account"
	subtitle="Authenticate your GitHub handle to tip contributors, claim sats and sync repositories."
	{onclose}
>
	<div class="mt-login-modal-body">
		<!-- Live Avatar Preview Card -->
		<div class="mt-preview-box">
			<div class="mt-preview-avatar-wrap">
				{#if previewAvatar}
					<img
						src={previewAvatar}
						alt="@{cleanHandle}"
						class="mt-preview-avatar"
						onerror={(e) => {
							const el = e.currentTarget as HTMLImageElement;
							el.src =
								'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="%239198a1"><circle cx="12" cy="12" r="10"/></svg>';
						}}
					/>
				{:else}
					<div class="mt-preview-placeholder">
						<svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
							<path
								d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
							></path>
						</svg>
					</div>
				{/if}
			</div>

			<div class="mt-preview-info">
				<div class="mt-preview-name-row">
					<span class="mt-preview-handle"
						>{cleanHandle ? `@${cleanHandle}` : 'No account selected'}</span
					>
					{#if cleanHandle}
						<Badge variant="paid" size="sm">GitHub Verified</Badge>
					{/if}
				</div>
				<span class="mt-preview-desc">
					{nameInput ||
						(cleanHandle ? `${cleanHandle} on GitHub` : 'Enter a username or pick a demo below')}
				</span>
			</div>
		</div>

		<!-- Quick Presets -->
		<div class="mt-presets-wrap">
			<span class="mt-presets-title">Quick Demo Accounts:</span>
			<div class="mt-presets-chips">
				{#each demoAccounts as d (d.handle)}
					<button
						type="button"
						class="mt-preset-chip {cleanHandle === d.handle ? 'chip-active' : ''}"
						onclick={() => selectPreset(d)}
					>
						<span class="chip-handle">@{d.handle}</span>
						<span class="chip-role">{d.role}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Form Fields -->
		<form
			class="mt-form-fields"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="mt-input-group">
				<label for="gh-handle" class="mt-label">GitHub Username *</label>
				<div class="mt-input-prefix-wrap">
					<span class="mt-prefix">@</span>
					<input
						id="gh-handle"
						type="text"
						class="mt-input with-prefix"
						placeholder="username (e.g. torvalds)"
						bind:value={handleInput}
						autocapitalize="none"
						spellcheck="false"
					/>
				</div>
			</div>

			<div class="mt-input-group">
				<label for="gh-name" class="mt-label">Display Name (Optional)</label>
				<input
					id="gh-name"
					type="text"
					class="mt-input"
					placeholder="Full Name (e.g. Linus Torvalds)"
					bind:value={nameInput}
				/>
			</div>

			<div class="mt-input-group">
				<label for="gh-token" class="mt-label">
					<span>GitHub Token / Handshake (Optional)</span>
					<span class="mt-optional-tag">Mock / Dev</span>
				</label>
				<input
					id="gh-token"
					type="password"
					class="mt-input font-mono"
					placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
					bind:value={tokenInput}
				/>
			</div>

			{#if errorMessage}
				<div class="mt-error-box">
					<span>{errorMessage}</span>
				</div>
			{/if}
		</form>
	</div>

	{#snippet footer()}
		<div class="mt-login-modal-footer">
			<Button variant="default" size="md" onclick={onclose}>Cancel</Button>
			<Button
				variant="primary"
				size="md"
				loading={connecting}
				disabled={!cleanHandle || connecting}
				onclick={handleSubmit}
			>
				Connect Account
			</Button>
		</div>
	{/snippet}
</Modal>

<style>
	.mt-login-modal-body {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 4px 0;
	}

	.mt-preview-box {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 14px;
		background: var(--mt-bg-subtle);
		border: 1px solid var(--mt-border);
		border-radius: 10px;
	}

	.mt-preview-avatar-wrap {
		width: 48px;
		height: 48px;
		border-radius: 9999px;
		overflow: hidden;
		flex-shrink: 0;
		background: var(--mt-surface);
		border: 1.5px solid var(--mt-border);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-preview-avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.mt-preview-placeholder {
		color: var(--mt-fg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mt-preview-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.mt-preview-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mt-preview-handle {
		font-size: 15px;
		font-weight: 700;
		color: var(--mt-fg);
	}

	.mt-preview-desc {
		font-size: 12px;
		color: var(--mt-fg-muted);
	}

	.mt-presets-wrap {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.mt-presets-title {
		font-size: 12px;
		font-weight: 600;
		color: var(--mt-fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.mt-presets-chips {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.mt-preset-chip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: 8px 12px;
		background: var(--mt-surface);
		border: 1px solid var(--mt-border);
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: all 0.15s ease;
	}

	.mt-preset-chip:hover {
		background: var(--mt-surface-hover);
		border-color: var(--mt-border-active);
		transform: translateY(-1px);
	}

	.chip-active {
		border-color: var(--mt-accent);
		background: var(--mt-accent-subtle);
	}

	.chip-handle {
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.chip-role {
		font-size: 11px;
		color: var(--mt-fg-muted);
	}

	.mt-form-fields {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.mt-input-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.mt-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 13px;
		font-weight: 600;
		color: var(--mt-fg);
	}

	.mt-optional-tag {
		font-size: 11px;
		font-weight: 400;
		color: var(--mt-fg-muted);
	}

	.mt-input-prefix-wrap {
		display: flex;
		align-items: center;
		position: relative;
	}

	.mt-prefix {
		position: absolute;
		left: 12px;
		font-size: 14px;
		font-weight: 600;
		color: var(--mt-fg-muted);
		pointer-events: none;
	}

	.mt-input {
		width: 100%;
		padding: 9px 12px;
		background: var(--mt-bg-inset);
		border: 1px solid var(--mt-border);
		border-radius: 6px;
		color: var(--mt-fg);
		font-size: 14px;
		font-family: inherit;
		outline: none;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.mt-input.with-prefix {
		padding-left: 28px;
	}

	.mt-input:focus {
		border-color: var(--mt-border-active);
		box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
	}

	.mt-error-box {
		padding: 8px 12px;
		background: var(--mt-danger-bg);
		border: 1px solid var(--mt-danger-border);
		border-radius: 6px;
		color: var(--mt-danger);
		font-size: 13px;
	}

	.mt-login-modal-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		width: 100%;
	}
</style>
