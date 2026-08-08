<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import { queryError } from '$lib/query';
	import PostSummaryCard from '$lib/components/forum/PostSummaryCard.svelte';
	import PostSummaryCardSkeleton from '$lib/components/forum/PostSummaryCardSkeleton.svelte';

	let { term }: { term: string } = $props();

	const search = createQuery(() => ({
		queryKey: ['forum', 'search', term, accounts.activeId],
		queryFn: async () => await accounts.active!.client.forum.search(term),
		enabled: accounts.isAuthed && term.length > 0
	}));

	const error = $derived(queryError(search));
</script>

<div class="results-head">
	<span class="text-sm sub">
		{#if search.isSuccess && search.data.ok}
			{search.data.results.length} result{search.data.results.length === 1 ? '' : 's'}
			for &ldquo;{term}&rdquo;
		{:else}
			Results for &ldquo;{term}&rdquo;
		{/if}
	</span>
</div>

{#if search.isPending}
	<ul class="list-card">
		{#each { length: 5 }, i (i)}
			<li><PostSummaryCardSkeleton /></li>
		{/each}
	</ul>
{:else if error}
	<p class="text-sm error">{error}</p>
{:else if search.isSuccess}
	{#if search.data.results.length === 0}
		<p class="text-sm sub">No posts match &ldquo;{term}&rdquo;.</p>
	{:else}
		<ul class="list-card">
			{#each search.data.results as result (result.post.id)}
				<li>
					<PostSummaryCard post={result.post} threadTitle={result.threadTitle} />
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.results-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.sub {
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-error);
	}
</style>
