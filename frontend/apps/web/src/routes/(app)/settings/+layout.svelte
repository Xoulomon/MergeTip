<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const SECTIONS = [
		{ href: '/settings/wallet', label: 'Sending wallet' },
		{ href: '/settings/receive', label: 'Receiving' },
		{ href: '/settings/limits', label: 'Limits and safety' },
		{ href: '/settings/account', label: 'Account' }
	];
</script>

<div class="grid gap-8 md:grid-cols-[12rem_1fr]">
	<nav aria-label="Settings">
		<h1 class="mb-3 text-xl font-semibold">Settings</h1>
		<ul class="flex gap-1 overflow-x-auto md:flex-col">
			{#each SECTIONS as section (section.href)}
				{@const current = page.url.pathname === section.href}
				<li>
					<a
						href={section.href}
						class="block rounded-md px-3 py-1.5 text-sm whitespace-nowrap hover:bg-hover {current
							? 'bg-subtle font-semibold'
							: 'text-fg-muted'}"
						aria-current={current ? 'page' : undefined}>{section.label}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
	<div class="flex min-w-0 flex-col gap-6">
		{@render children()}
	</div>
</div>
