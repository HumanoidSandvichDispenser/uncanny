<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import CategoryCard from '$lib/components/forum/CategoryCard.svelte';

	const categories = createQuery(() => ({
		queryKey: ['forum', 'categories', accounts.activeId],
		queryFn: async () => await accounts.active!.client.forum.categoriesGet(),
		enabled: accounts.isAuthed
	}));
</script>

{#if categories.isPending}
	<p class="text-sm sub">Loading categories&hellip;</p>
{:else if categories.isError}
	<p class="text-sm error">{categories.error.message}</p>
{:else if categories.isSuccess}
	<ul class="list">
		{#each categories.data.categories as cat (cat.id)}
			<li>
				<CategoryCard category={cat} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	.sub {
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-error);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		list-style: none;
	}
</style>
