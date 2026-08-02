<script lang="ts">
	import { page } from '$app/state';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import type { ForumPost } from '@sandvichxyz/pecans';
	import ArrowLineUpIcon from 'phosphor-svelte/lib/ArrowLineUpIcon';
	import ArrowLineDownIcon from 'phosphor-svelte/lib/ArrowLineDownIcon';
	import { accounts } from '$lib/accounts.svelte';
	import { getPageNav } from '$lib/nav.svelte';
	import { observeVisible } from '$lib/actions/observeVisible';
	import PostCard from '$lib/components/forum/PostCard.svelte';
	import { transitionSettled } from '$lib/transition';

	const pageNav = getPageNav();

	const category = $derived(page.params.category!);
	const threadId = $derived(Number(page.params.thread));

	const mode = $derived(page.url.searchParams.get('view') === 'new' ? 'NEW' : 'BEGINNING');

	type PageParam = {
		type: 'BEGINNING' | 'END' | 'NEW' | 'AFTER_POST' | 'BEFORE_POST';
		postId: number;
	};

	let override = $state<PageParam | null>(null);

	const startParam = $derived.by<PageParam>(() => {
		if (override !== null) {
			return override;
		}

		if (mode === 'NEW') {
			return { type: 'NEW', postId: 0 };
		}

		return { type: 'BEGINNING', postId: 0 };
	});

	const view = createInfiniteQuery(() => ({
		queryKey: ['forum', 'thread', threadId, startParam, accounts.activeId],
		enabled: accounts.isAuthed,
		initialPageParam: startParam,

		queryFn: async ({ pageParam }: { pageParam: PageParam }) => {
			const withContext =
				pageParam.type === 'BEGINNING' || pageParam.type === 'END' || pageParam.type === 'NEW';

			return await accounts.active!.client.forum.viewPosts(
				threadId,
				pageParam.type,
				pageParam.postId,
				withContext,
				false
			);
		},

		getNextPageParam: (lastPage): PageParam | undefined => {
			if (lastPage.numPostsAfter <= 0 || lastPage.posts.length === 0) {
				return undefined;
			}

			const newest = lastPage.posts.reduce((m, p) => (p.time > m.time ? p : m));

			return { type: 'AFTER_POST', postId: newest.id };
		},

		getPreviousPageParam: (firstPage): PageParam | undefined => {
			// firstPage is the oldest window
			if (firstPage.numPostsBefore <= 0 || firstPage.posts.length === 0) {
				return undefined;
			}

			const oldest = firstPage.posts.reduce((m, p) => (p.time < m.time ? p : m));

			return { type: 'BEFORE_POST', postId: oldest.id };
		}
	}));

	const pages = $derived(view.data?.pages ?? []);

	const posts = $derived.by(() => {
		const byId = new Map<number, ForumPost>();

		for (const pg of pages) {
			for (const post of pg.posts) {
				byId.set(post.id, post);
			}
		}

		return [...byId.values()].sort((a, b) => a.time - b.time);
	});

	const before = $derived(pages[0]?.numPostsBefore ?? 0);
	const after = $derived(pages.at(-1)?.numPostsAfter ?? 0);
	const total = $derived(before + posts.length + after);

	const meta = $derived(pages.find((p) => p.thread)?.thread);
	const title = $derived(meta?.title ?? 'Thread');

	let pendingScroll = $state<'top' | 'bottom' | 'unread' | null>(null);

	let lastNavKey = '';
	$effect(() => {
		const navKey = `${threadId}:${mode}`;

		if (navKey === lastNavKey) {
			return;
		}

		lastNavKey = navKey;
		override = null;
		pendingScroll = mode === 'NEW' ? 'unread' : null;
	});

	// Perform the pending scroll once the window has rendered.
	$effect(() => {
		if (!view.isSuccess || pendingScroll === null || posts.length === 0) {
			return;
		}

		const intent = pendingScroll;
		const target =
			intent === 'unread'
				? (posts.find((p) => p.new) ?? posts.at(-1))
				: intent === 'bottom'
					? posts.at(-1)
					: posts[0];
		if (!target) {
			return;
		}

		pendingScroll = null;

		// wait for the transition to settle before scrolling, so that the scroll
		// position is correct
		transitionSettled().then(() => {
			requestAnimationFrame(() => {
				document
					.getElementById(`post-${target.id}`)
					?.scrollIntoView({ block: intent === 'bottom' ? 'end' : 'start' });
			});
		});
	});

	function jumpToStart() {
		override = { type: 'BEGINNING', postId: 0 };
		pendingScroll = 'top';
	}

	function jumpToLatest() {
		override = { type: 'END', postId: 0 };
		pendingScroll = 'bottom';
	}

	$effect(() => {
		pageNav.title = title;
	});

	$effect(() => {
		pageNav.content = controls;
	});

	$effect(() => () => pageNav.reset());
</script>

<main class="page">
	<a
		class="text-sm crumb"
		href="/forum/{category}"
		data-nav="back"
	>
		{category}
	</a>

	<header class="head" use:observeVisible={(visible) => (pageNav.visible = !visible)}>
		<div class="titlebar">
			<h1>{title}</h1>
			{#if meta?.locked}
				<span class="text-xs sub">Locked</span>
			{/if}
		</div>
		<div class="nav">{@render controls()}</div>
	</header>

	{#if view.isPending}
		<p class="text-sm sub">Loading thread&hellip;</p>
	{:else if view.isError}
		<p class="text-sm error">{view.error.message}</p>
	{:else}
		<div class="posts">
			{#if view.hasPreviousPage}
				<button
					class="btn btn-secondary label-sm gap"
					onclick={() => view.fetchPreviousPage()}
					disabled={view.isFetchingPreviousPage}
				>
					{view.isFetchingPreviousPage
						? 'Loading earlier posts…'
						: `Load ${before.toLocaleString()} earlier posts`}
				</button>
			{/if}

			{#each posts as post (post.id)}
				<PostCard {post} />
			{/each}

			{#if view.hasNextPage}
				<button
					class="btn btn-secondary label-sm gap"
					onclick={() => view.fetchNextPage()}
					disabled={view.isFetchingNextPage}
				>
					{view.isFetchingNextPage
						? 'Loading newer posts…'
						: `Load ${after.toLocaleString()} newer posts`}
				</button>
			{/if}
		</div>
	{/if}
</main>

{#snippet controls()}
	<button
		class="btn btn-secondary btn-icon"
		onclick={jumpToStart}
		disabled={view.isFetching}
		title="Jump to the first post"
		aria-label="Jump to the first post"
	>
		<ArrowLineUpIcon weight="bold" />
	</button>
	<button
		class="btn btn-secondary btn-icon"
		onclick={jumpToLatest}
		disabled={view.isFetching}
		title="Jump to the latest post"
		aria-label="Jump to the latest post"
	>
		<ArrowLineDownIcon weight="bold" />
	</button>
{/snippet}

<style>
	.page {
		max-width: var(--width-content);
		width: 100%;
		margin: 0 auto;
		padding: var(--space-padding-xl);
	}

	@media (max-width: 640px) {
		.page {
			padding: 0;
		}
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		margin-bottom: var(--space-padding-md);
		border-bottom: var(--border-thin) solid var(--color-border);
	}

	.titlebar {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.titlebar h1 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nav {
		flex: none;
		display: flex;
		gap: var(--space-2);
	}

	.nav-btn {
		padding: var(--space-2);
	}

	.crumb {
		display: inline-block;
		margin-bottom: var(--space-2);
		color: var(--color-text-secondary);
	}

	.sub {
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-error);
	}

	.posts {
		display: flex;
		flex-direction: column;
	}

	.posts :global(.post:not(:last-child)) {
		border-bottom: var(--border-thin) solid var(--color-border);
	}

	.gap {
		align-self: center;
		margin: var(--space-padding-sm) 0;
	}
</style>
