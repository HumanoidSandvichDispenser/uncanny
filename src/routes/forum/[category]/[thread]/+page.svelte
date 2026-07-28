<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import PostCard from '$lib/components/forum/PostCard.svelte';

	const category = $derived(page.params.category!);
	const threadId = $derived(Number(page.params.thread));

	// ?view=new jumps to the first unread post; otherwise start at the top
	const mode = $derived(page.url.searchParams.get('view') === 'new' ? 'NEW' : 'BEGINNING');

	// both windows fetch with getSomeBackscroll so there's context around the anchor
	const view = createQuery(() => ({
		queryKey: ['forum', 'thread', threadId, mode, accounts.activeId],
		queryFn: async () =>
			await accounts.active!.client.forum.viewPosts(threadId, mode, 0, true, false),
		enabled: accounts.isAuthed
	}));

	const posts = $derived([...(view.data?.posts ?? [])].sort((a, b) => a.time - b.time));
	const title = $derived(view.data?.thread?.title ?? 'Thread');

	// after a NEW load, scroll to the first unread post (or the newest if all read)
	let scrolledKey = '';
	$effect(() => {
		if (!view.isSuccess || mode !== 'NEW') {
			return;
		}

		const key = `${threadId}:${mode}`;
		if (scrolledKey === key) {
			return;
		}

		const target = posts.find((p) => p.new) ?? posts.at(-1);
		if (!target) {
			return;
		}

		scrolledKey = key;
		// wait for the posts to render before anchoring
		requestAnimationFrame(() => {
			document.getElementById(`post-${target.id}`)?.scrollIntoView({ block: 'start' });
		});
	});
</script>

<main class="page">
	<header class="head">
		<a class="text-sm crumb" href="/forum/{category}">Back</a>
		<h1>{title}</h1>
		{#if view.data?.thread?.locked}
			<span class="text-xs sub">Locked</span>
		{/if}
	</header>

	{#if view.isPending}
		<p class="text-sm sub">Loading thread&hellip;</p>
	{:else if view.isError}
		<p class="text-sm error">{view.error.message}</p>
	{:else}
		<div class="posts">
			{#each posts as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
	{/if}
</main>

<style>
	.page {
		max-width: var(--width-content);
		margin: 0 auto;
		padding: var(--space-padding-xl);
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

	.posts {
		display: flex;
		flex-direction: column;
	}

	.posts :global(.post:not(:last-child)) {
		border-bottom: var(--border-thin) solid var(--color-border);
	}
</style>
