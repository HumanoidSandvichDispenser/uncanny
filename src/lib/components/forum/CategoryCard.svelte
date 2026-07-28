<script lang="ts">
	import type { ForumCategory } from '@sandvichxyz/pecans';

	let { category }: { category: ForumCategory } = $props();
</script>

<a class="row" href="/forum/{category.id}">
	<div class="main-col">
		<span class="label-md name">
			{category.name}
			{#if category.newThreads > 0}
				<span class="badge label-xs">{category.newThreads} new</span>
			{/if}
		</span>
		<span class="text-sm sub">{category.description}</span>
	</div>
	<div class="meta text-xs sub">
		<span>{category.threads} threads</span>
		<span>{category.posts} posts</span>
	</div>
</a>

<style scoped>
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-padding-sm);
		color: var(--color-text);
	}

	.row:hover {
		background: var(--color-surface-hover);
		text-decoration: none;
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
		flex: 1;
	}

	.name {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.badge {
		padding: 2px var(--space-2);
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 12%, transparent);
		border-radius: var(--radius-full);
	}

	.sub {
		color: var(--color-text-secondary);
	}

	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-1);
		white-space: nowrap;
	}
</style>
