<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import type { FeedItem } from '@sandvichxyz/pecans';
	import { accounts } from '$lib/accounts.svelte';
	import { batched } from '$lib/batch';
	import { relativeTime } from '$lib/format';
	import { displayName } from '$lib/profiles.svelte';
	import { queryError } from '$lib/query';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import NotePencilIcon from 'phosphor-svelte/lib/NotePencilIcon';
	import ChatCircleIcon from 'phosphor-svelte/lib/ChatCircleIcon';
	import UserPlusIcon from 'phosphor-svelte/lib/UserPlusIcon';

	const PREVIEW_SIZE = 8;

	const feed = createQuery(() => ({
		queryKey: ['feed', 'preview', accounts.activeId],
		queryFn: async () => {
			const client = accounts.active!.client;
			return await batched(client, client.feed.start(null, PREVIEW_SIZE));
		},
		enabled: accounts.isAuthed
	}));

	const error = $derived(queryError(feed));
	const items = $derived(feed.data?.items ?? []);

	function label(item: FeedItem): string {
		switch (item.type) {
			case 'forum.thread':
				return 'started a new thread';
			case 'qa.newquestion':
				return 'asked a new question';
			case 'account.register':
				return 'joined Two Cans & String';
		}
	}

	function detail(item: FeedItem): string {
		switch (item.type) {
			case 'forum.thread':
			case 'qa.newquestion':
				return item.data.preview || item.title;
			case 'account.register':
				return '';
		}
	}
</script>

<section class="widget">
	<header class="head">
		<span class="tick"></span>
		<h3 class="label-xs title">Feed</h3>
		<a class="head-link label-sm" href="/feed">
			View all
			<ArrowRightIcon size={13} />
		</a>
	</header>

	{#if feed.isPending}
		<p class="empty text-sm">Loading&hellip;</p>
	{:else if error}
		<p class="empty text-sm error">{error}</p>
	{:else if items.length === 0}
		<p class="empty text-sm">Nothing new.</p>
	{:else}
		<ul class="list-card">
			{#each items as item (item.id)}
				<li>
					<a class="list-row" href={item.url}>
						<span class="glyph">
							{#if item.type === 'forum.thread'}
								<NotePencilIcon size={15} />
							{:else if item.type === 'qa.newquestion'}
								<ChatCircleIcon size={15} />
							{:else}
								<UserPlusIcon size={15} />
							{/if}
						</span>
						<div class="body">
							<p class="label text-sm">
								<span class="user">{displayName(item.owner)}</span>
								{label(item)}
							</p>
							{#if detail(item)}
								<p class="detail text-xs">{detail(item)}</p>
							{/if}
						</div>
						<time class="when text-xs">{relativeTime(item.time)}</time>
					</a>
				</li>
			{/each}
		</ul>
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
		align-items: center;
		gap: var(--space-2);
	}

	.title {
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.09em;
	}

	.head-link {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		color: var(--color-primary);
	}

	.head-link:hover {
		text-decoration: none;
	}

	.tick {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-sm);
		background: var(--color-neutral-400);
		flex: none;
	}

	.glyph {
		margin-top: 1px;
		color: var(--color-text-tertiary);
		flex: none;
	}

	.body {
		min-width: 0;
		flex: 1;
	}

	.label {
		color: var(--color-text-secondary);
	}

	.user {
		color: var(--color-text);
		font-weight: 600;
	}

	.list-row:hover .label {
		color: var(--color-primary);
	}

	.detail {
		margin-top: 2px;
		color: var(--color-text-secondary);
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.when {
		flex: none;
		color: var(--color-text-tertiary);
		font-variant-numeric: tabular-nums;
	}

	.empty {
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-error);
	}
</style>
