<script lang="ts">
	import { page } from '$app/state';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import ThreadCard from '$lib/components/forum/ThreadCard.svelte';
	import ThreadCardSkeleton from '$lib/components/forum/ThreadCardSkeleton.svelte';
	import PageNav from '$lib/components/PageNav.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	const category = $derived(page.params.category!);

	const threads = createInfiniteQuery(() => ({
		queryKey: ['forum', 'threads', category, accounts.activeId],
		queryFn: async ({ pageParam }) =>
			await accounts.active!.client.forum.threadList(category, pageParam),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((n, p) => n + p.threads.length, 0);
			return loaded < lastPage.totalThreads ? loaded : undefined;
		},
		enabled: accounts.isAuthed
	}));

	// header info comes from the first page; null until it lands, so the header
	// shows a skeleton rather than the raw slug
	const first = $derived(threads.data?.pages[0]);
	const title = $derived(first ? first.name || category : null);
</script>

<PageNav {title} />

<main class="page">
	<header class="head">
		<a class="text-sm crumb" href="/forum">Forum</a>
		{#if first}
			<h1>{title}</h1>
			<span class="text-sm sub">{first.totalThreads} threads</span>
		{:else}
			<h1><Skeleton text width="9rem" /></h1>
			<span class="text-sm sub"><Skeleton text width="5rem" /></span>
		{/if}
	</header>

	{#if threads.isPending}
		<ul class="list">
			{#each { length: 6 }, i (i)}
				<li><ThreadCardSkeleton /></li>
			{/each}
		</ul>
	{:else if threads.isError}
		<p class="text-sm error">{threads.error.message}</p>
	{:else}
		<ul class="list">
			{#each threads.data.pages as pg, i (i)}
				{#each pg.threads as thread (thread.id)}
					<li>
						<ThreadCard {thread} />
					</li>
				{/each}
			{/each}
		</ul>

		{#if threads.hasNextPage}
			<button
				class="btn btn-secondary label-md more"
				onclick={() => threads.fetchNextPage()}
				disabled={threads.isFetchingNextPage}
			>
				{threads.isFetchingNextPage ? 'Loading…' : 'Load more'}
			</button>
		{/if}
	{/if}
</main>

<style>
	.page {
		width: 100%;
		max-width: var(--width-content);
		margin: 0 auto;
		padding: var(--space-padding-xl);
	}

	@media (max-width: 640px) {
		.page {
			padding: var(--space-padding-sm);
		}
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-padding-md);
	}

	.crumb {
		color: var(--color-text-secondary);
	}

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

	.more {
		align-self: center;
		margin-top: var(--space-padding-md);
	}
</style>
