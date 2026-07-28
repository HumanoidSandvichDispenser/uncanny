<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import { batched } from '$lib/batch';
	import CategoryCard from '$lib/components/forum/CategoryCard.svelte';

	const categories = createQuery(() => ({
		queryKey: ['forum', 'categories', accounts.activeId],
		queryFn: async () => {
			const client = accounts.active!.client;
			return await batched(client, client.forum.categoriesGet());
		},
		enabled: accounts.isAuthed
	}));

	// filter out "followed" category:
	const filteredCategories = $derived(
		categories.data?.categories.filter((c) => c.id !== 'followed') ?? []
	);
</script>

{#if categories.isPending}
	<p class="text-sm sub">Loading categories&hellip;</p>
{:else if categories.isError}
	<p class="text-sm error">{categories.error.message}</p>
{:else if categories.isSuccess}
	<ul class="list">
		{#each filteredCategories as cat (cat.id)}
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
		list-style: none;
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.list li:not(:last-child) {
		border-bottom: var(--border-thin) solid var(--color-border);
	}
</style>
