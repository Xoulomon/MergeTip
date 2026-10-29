<script lang="ts">
	import { Button, Card } from '@mergetip/ui';
	import { EXTENSION_DOWNLOADS, EXTENSION_RELEASE_URL } from '#lib/links.ts';
</script>

<svelte:head><title>Browser extension · MergeTip</title></svelte:head>

<div class="mx-auto flex max-w-2xl flex-col gap-6 py-4">
	<header>
		<h1 class="text-2xl font-semibold">Browser extension</h1>
		<p class="mt-2 text-fg-muted">
			Adds <strong class="text-fg">⚡ Tip</strong> buttons on GitHub pull requests and issues: next
			to the title for the author, and next to each commenter and reviewer. Pick an amount, and it
			posts the <code class="font-mono">/tip</code> comment for you.
		</p>
		<p class="mt-2 text-sm text-fg-muted">
			It isn't in the Chrome Web Store or Firefox Add-ons yet, so it's installed by hand. It takes
			about a minute. All files and checksums are on the
			<a class="text-info underline" href={EXTENSION_RELEASE_URL}>release page</a>.
		</p>
	</header>

	<Card title="Chrome, Brave, Edge and other Chromium browsers">
		<div class="flex flex-col gap-3 p-4 text-sm">
			<ol class="list-decimal space-y-2 pl-5">
				<li>Download the zip below and <strong>unzip it</strong>.</li>
				<li>
					Open <code class="font-mono">chrome://extensions</code> (Brave:
					<code class="font-mono">brave://extensions</code>, Edge:
					<code class="font-mono">edge://extensions</code>).
				</li>
				<li>Turn on <strong>Developer mode</strong>.</li>
				<li>Click <strong>Load unpacked</strong> and choose the unzipped folder.</li>
			</ol>
			<p class="text-fg-muted">Keep the folder: the browser loads the extension from it.</p>
			<div>
				<Button variant="primary" href={EXTENSION_DOWNLOADS.chrome}>Download for Chrome</Button>
			</div>
		</div>
	</Card>

	<Card title="Firefox">
		<div class="flex flex-col gap-3 p-4 text-sm">
			<ol class="list-decimal space-y-2 pl-5">
				<li>Download the zip below (don't unzip it).</li>
				<li>Open <code class="font-mono">about:debugging#/runtime/this-firefox</code>.</li>
				<li>Click <strong>Load Temporary Add-on…</strong> and choose the zip.</li>
			</ol>
			<p class="text-fg-muted">Firefox removes it when it restarts; load it again afterwards.</p>
			<div>
				<Button variant="primary" href={EXTENSION_DOWNLOADS.firefox}>Download for Firefox</Button>
			</div>
		</div>
	</Card>

	<Card title="Connect it to your account">
		<ol class="list-decimal space-y-2 p-4 pl-9 text-sm">
			<li>
				Open any pull request or issue on github.com and click a <strong>⚡ Tip</strong> button.
			</li>
			<li>
				Click <strong>Connect MergeTip</strong>, sign in with GitHub if asked, and approve on the
				page that opens.
			</li>
			<li>Click <strong>⚡ Tip</strong> again and send your first tip.</li>
		</ol>
	</Card>

	<p class="text-sm text-fg-muted">
		The extension can post tips and read your limits. It never sees your wallet connection and can't
		confirm large tips. Disconnect it from its popup; deleting your MergeTip account revokes it.
	</p>
</div>
