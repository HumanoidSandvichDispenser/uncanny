<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import { batched } from '$lib/batch';
	import CategoryCard from '$lib/components/forum/CategoryCard.svelte';

	const categories = createQuery(() => ({
		queryKey: ['forum', 'categories', accounts.activeId],
		queryFn: () => batched(accounts.active!.client.forum.categoriesGet()),
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
	<ul class="list-card">
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
</style>
