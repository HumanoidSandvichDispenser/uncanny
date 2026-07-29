<script lang="ts">
	import type { ForumPost } from '@sandvichxyz/pecans';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { displayName } from '$lib/profiles.svelte';
	import { relativeTime } from '$lib/format';
	import Ucp from '$lib/ucp/components/Ucp.svelte';

	let { post }: { post: ForumPost } = $props();
</script>

<article id="post-{post.id}" class="post" class:unread={post.new}>
	<a class="who" href="/users/{post.user}">
		<UserAvatar name={post.user} size={40} status />
	</a>
	<div class="body">
		<header class="meta">
			<a class="name label-md" href="/users/{post.user}">{displayName(post.user)}</a>
			<span class="text-xs sub">{relativeTime(post.time)}</span>
		</header>
		<div class="text">
			{#if post.ucpEnabled}
				<Ucp text={post.ucpText} />
			{:else}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html post.text}
			{/if}
		</div>
	</div>
</article>

<style>
	.post {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-padding-md);
	}

	.who {
		flex-shrink: 0;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
		flex: 1;
	}

	.meta {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.name {
		color: var(--color-text);
	}

	.sub {
		color: var(--color-text-secondary);
	}

	.text {
		overflow-wrap: anywhere;
		color: var(--color-text);
	}
</style>
