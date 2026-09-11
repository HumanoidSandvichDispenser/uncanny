<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';

	let { lines = 3 }: { lines?: number } = $props();
</script>

<article class="message">
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
	.message {
		display: flex;
		gap: var(--space-gap-sm);
		padding: var(--space-padding-md) var(--space-padding-sm);
	}

	.who {
		flex: none;
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
