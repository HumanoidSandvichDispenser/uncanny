<script lang="ts">
	import type { ThreadListPost } from '@sandvichxyz/pecans';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { displayName } from '$lib/profiles.svelte';
	import { relativeTime } from '$lib/format';

	let { post, threadTitle }: { post: ThreadListPost; threadTitle: string } = $props();
</script>

<a class="row" href="/forum/{post.category}/{post.thread}">
	<div class="main-col">
		<div class="user">
			<div class="left">
				<UserAvatar name={post.author} size={24} />
				<div class="text-xs">{displayName(post.author)}</div>
				<span>&middot;</span>
				<!-- TODO: include category and cache category title -->
				<div class="text-xs sub">{threadTitle}</div>
			</div>
			<div class="right">
				<div class="text-xs sub">{relativeTime(post.time)}</div>
			</div>
		</div>
		<span class="snippet">
			{post.text}
		</span>
	</div>
</a>

<style scoped>
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-padding-sm);
		color: var(--color-text);
	}

	.row:hover {
		background-color: var(--color-surface-hover);
		text-decoration: none;
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-width: 0;
		flex: 1;
	}

	.user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		white-space: nowrap;
		justify-content: space-between;
	}

	.user .left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.sub {
		color: var(--color-text-secondary);
	}

	.snippet {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		color: var(--color-text-secondary);
	}
</style>
