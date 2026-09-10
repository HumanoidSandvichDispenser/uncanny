<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';

	let {
		lines = 3,
		grouped = false
	}: {
		lines?: number;
		grouped?: boolean;
	} = $props();
</script>

<article class="post">
	<div class="who">
		{#if !grouped}
			<Skeleton circle size="40px" />
		{/if}
	</div>
	<div class="body">
		{#if !grouped}
			<header class="meta">
				<span class="label-md"><Skeleton text width="7rem" /></span>
				<span class="text-xs"><Skeleton text width="4rem" /></span>
			</header>
		{/if}
		<Skeleton text {lines} />
	</div>
</article>

<style>
	.post {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-1) var(--space-padding-sm);
	}

	.who {
		flex: none;
		width: 40px;
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
