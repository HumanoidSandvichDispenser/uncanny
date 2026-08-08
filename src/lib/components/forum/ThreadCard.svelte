<script lang="ts">
	import type { ForumThread } from '@sandvichxyz/pecans';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import ChatCircleIcon from 'phosphor-svelte/lib/ChatCircleIcon';
	import { displayName } from '$lib/profiles.svelte';
	import { relativeTime } from '$lib/format';

	let { thread }: { thread: ForumThread } = $props();

	const first = $derived(thread.firstPost);
	const last = $derived(thread.lastPost);
</script>

<a class="row" href="/forum/{thread.category}/{thread.id}{thread.new ? '?view=new' : ''}">
	<div class="main-col">
		<span class="label-md headline">
			<div class="title">
				<h2 class="h3">
					{thread.title}
				</h2>
				{#if thread.new}
					<span class="badge label-xs">new</span>
				{/if}
			</div>
			<span class="replies text-xs sub" title="{thread.replies} replies">
				<ChatCircleIcon weight="fill" />
				{thread.replies}
			</span>
		</span>
		<div class="user">
			<UserAvatar name={first.author} size={32} />
			<div class="user-col text-xs">{displayName(first.author)}</div>
			<span class="text-lg sub">&middot;</span>
			<div class="text-xs sub">{relativeTime(first.time)}</div>
		</div>
		<span class="thread-preview">
			{first.text}
		</span>
		{#if last.id !== first.id}
			<div class="last-post sub">
				<span>
					<i>
						{thread.lastPost.text}
					</i>
				</span>
				<div class="avatar">
					<UserAvatar name={thread.lastPost.author} size={24} />
				</div>
			</div>
		{:else}
			<div class="last-post sub no-replies">
				<span>
					<i> No replies yet. Be the first one! </i>
				</span>
			</div>
		{/if}
	</div>
</a>

<style>
	.row {
		display: flex;
		align-items: center;
		padding: var(--space-padding-lg);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text);

		@media (--mobile) {
			padding: var(--space-padding-sm);
		}
	}

	.row:hover {
		border-color: var(--color-primary);
		text-decoration: none;
	}

	@media (hover: none) {
		.row:active {
			background: var(--color-surface-active);
		}
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-gap-sm);
		min-width: 0;
		flex: 1;

		@media (--mobile) {
			gap: var(--space-gap-xs);
		}
	}

	.headline {
		display: flex;
		gap: var(--space-gap-sm);
	}

	.title {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: var(--space-gap-xs);
	}

	.title h2 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		@media (--mobile) {
			font-size: var(--text-xl);
		}
	}

	.replies {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		margin-left: auto;
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

	.user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		white-space: nowrap;
	}

	.user-col {
		display: flex;
		flex-direction: column;
	}

	.thread-preview {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.last-post {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.last-post span {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: right;
	}

	.last-post.no-replies span {
		overflow: visible;
	}

	.last-post .avatar {
		align-self: flex-end;
	}
</style>
