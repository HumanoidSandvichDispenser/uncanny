<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { batched } from '$lib/batch';
	import { accounts } from '$lib/accounts.svelte';
	import { queryError } from '$lib/query';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import PostSummaryCard from '$lib/components/forum/PostSummaryCard.svelte';

	const followed = createQuery(() => ({
		queryKey: ['forum', 'threads', 'followed', accounts.activeId],
		queryFn: async () => {
			const client = accounts.active!.client;
			return await batched(client, client.forum.threadList('followed'));
		},
		enabled: accounts.isAuthed
	}));

	const error = $derived(queryError(followed));
</script>

<section class="widget">
	<div class="head">
		<h3>Threads you follow</h3>
		<a class="view-all label-sm" href="/forum/followed">
			View all
			<ArrowRightIcon />
		</a>
	</div>

	{#if followed.isPending}
		<p class="empty-msg text-sm">Loading followed threads&hellip;</p>
	{:else if error}
		<p class="empty-msg text-sm error">{error}</p>
	{:else if followed.isSuccess}
		{#if followed.data.threads.length === 0}
			<p class="empty-msg text-sm">No new posts in threads you follow.</p>
		{:else}
			<ul class="list">
				{#each followed.data.threads as thread (thread.id)}
					<li>
						<PostSummaryCard post={thread.lastPost} threadTitle={thread.title} />
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>

<style>
	.widget {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.view-all {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-primary);
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.empty-msg {
		padding: var(--space-2) 0;
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
