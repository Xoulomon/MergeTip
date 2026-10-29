<script lang="ts">
	import { Button } from '@mergetip/ui';
	import GitHubMark from '#lib/components/GitHubMark.svelte';
	import TipPlayground from '#lib/components/TipPlayground.svelte';
	import { INSTALL_APP_URL } from '#lib/links.ts';
	import { session, signIn } from '#lib/session.svelte.ts';

	const STEPS = [
		{
			title: 'Install and connect',
			body: 'Install the GitHub App on your repositories and connect your Lightning wallet once, with spending limits you choose.'
		},
		{
			title: 'Comment /tip',
			body: 'Write /tip @user 2100 on a pull request or issue, or click ⚡ Tip with the browser extension.'
		},
		{
			title: 'Verified, then paid',
			body: 'MergeTip checks the work happened, pays from your wallet to theirs, and posts a public receipt in the thread.'
		}
	];
</script>

<svelte:head>
	<title>MergeTip · Tip open-source contributors in sats</title>
</svelte:head>

<section class="py-10 text-center sm:py-16">
	<p class="text-5xl text-bolt" aria-hidden="true">⚡</p>
	<h1 class="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
		Tip open-source contributors in sats, straight from GitHub.
	</h1>
	<p class="mx-auto mt-4 max-w-xl text-fg-muted text-balance">
		Reward reviews, merged pull requests, triage and docs. Payments go from your wallet to theirs,
		and all they need is a GitHub account.
	</p>
	<div class="mt-8 flex flex-wrap justify-center gap-3">
		<Button size="lg" variant="primary" href={INSTALL_APP_URL}>Install GitHub App</Button>
		{#if session.me}
			<Button size="lg" href="/dashboard">Open dashboard</Button>
		{:else}
			<Button size="lg" onclick={() => signIn('/dashboard')}>
				<GitHubMark /> Sign in with GitHub
			</Button>
		{/if}
	</div>
</section>

<section aria-labelledby="how" class="py-8">
	<h2 id="how" class="text-center text-xl font-semibold">How it works</h2>
	<ol class="mt-6 grid gap-4 sm:grid-cols-3">
		{#each STEPS as step, index (step.title)}
			<li class="rounded-md border border-default p-4">
				<p class="text-xs font-semibold text-bolt">Step {index + 1}</p>
				<h3 class="mt-1 font-semibold">{step.title}</h3>
				<p class="mt-2 text-sm text-fg-muted">{step.body}</p>
			</li>
		{/each}
	</ol>
	<p class="mt-4 text-center text-sm text-fg-muted">
		Tip in one click from GitHub:
		<a class="text-info underline" href="/extension">get the browser extension</a>
		for Chrome, Brave, Edge and Firefox.
	</p>
</section>

<section aria-labelledby="demo" class="grid gap-6 py-8 md:grid-cols-2 md:items-start">
	<div>
		<h2 id="demo" class="text-xl font-semibold">See what the bot does</h2>
		<p class="mt-2 text-sm text-fg-muted">
			Commands follow one simple pattern. Add <code class="font-mono">on-merge</code> to pay only if
			the pull request is merged, and <code class="font-mono">for</code> to add a public note.
		</p>
		<pre
			class="mt-4 overflow-x-auto rounded-md border border-default bg-subtle p-3 font-mono text-xs">/tip @&lt;username&gt; &lt;amount&gt;[k] [sats] [on-merge] [for &lt;note&gt;]</pre>
		<ul class="mt-4 space-y-2 text-sm text-fg-muted">
			<li>
				<strong class="text-fg">Non-custodial.</strong> Sats move from your wallet to theirs over Lightning.
			</li>
			<li>
				<strong class="text-fg">Verified.</strong> Only people who reviewed, committed or commented can
				be tipped.
			</li>
			<li>
				<strong class="text-fg">Capped.</strong> Per-tip and daily limits, and a confirmation step for
				large tips.
			</li>
		</ul>
	</div>
	<TipPlayground />
</section>
