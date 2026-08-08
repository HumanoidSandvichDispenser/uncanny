<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';

	/** Posts vary a lot in length; vary this so a stack doesn't look photocopied. */
	let { lines = 3 }: { lines?: number } = $props();
</script>

<article class="post">
	<div class="who">
		<Skeleton circle size="40px" />
	</div>
	<div class="body">
		<header class="meta">
			<span class="label-md"><Skeleton text width="7rem" /></span>
			<span class="text-xs"><Skeleton text width="4rem" /></span>
		</header>
		<Skeleton text {lines} />
	</div>
</article>

<style>
	.post {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-padding-md);
	}

	.who {
		flex-shrink: 0;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
		flex: 1;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}
</style>
