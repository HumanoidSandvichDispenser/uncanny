<script lang="ts">
	import type { ForumSearchResult } from '@sandvichxyz/pecans';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { displayName } from '$lib/profiles.svelte';
	import { relativeTime } from '$lib/format';

	let { result }: { result: ForumSearchResult } = $props();

	const post = $derived(result.post);
</script>

<a class="row" href="/forum/{post.category}/{post.thread}">
	<div class="main-col">
		<span class="label-md title">
			<h2 class="h3">{result.threadTitle}</h2>
		</span>
		<div class="user">
			<UserAvatar name={post.author} size={32} />
			<div class="text-xs">{displayName(post.author)}</div>
			<span class="text-lg sub">&middot;</span>
			<div class="text-xs sub">{relativeTime(post.time)}</div>
		</div>
		<span class="snippet">
			{post.text}
		</span>
	</div>
</a>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-padding-lg);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text);
	}

	.row:hover {
		border-color: var(--color-primary);
		text-decoration: none;
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-width: 0;
		flex: 1;
	}

	.title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		white-space: nowrap;
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
