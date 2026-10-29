<script lang="ts">
	import { REPO_URL } from '#lib/links.ts';
</script>

<footer class="mt-16 border-t border-default">
	<div
		class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-fg-muted"
	>
		<p>
			<span class="text-bolt" aria-hidden="true">⚡</span> MergeTip never holds your sats: tips go straight
			from your wallet to the contributor's.
		</p>
		<nav aria-label="Footer" class="flex gap-4">
			<a class="hover:text-fg hover:underline" href={REPO_URL}>Source (MIT)</a>
			<a class="hover:text-fg hover:underline" href="{REPO_URL}/blob/main/SECURITY.md">Security</a>
		</nav>
	</div>
</footer>
