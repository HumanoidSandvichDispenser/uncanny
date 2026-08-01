<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { displayName } from '$lib/profiles.svelte';
	import { queryError } from '$lib/query';
	import { dashboardQueryOptions } from '$lib/dashboard';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';

	const dash = createQuery(() => dashboardQueryOptions());
	const error = $derived(queryError(dash));
	const posts = $derived(dash.data?.recentForumPosts ?? []);
</script>

<section class="widget">
	<header class="head">
		<span class="tick"></span>
		<h3 class="label-xs title">Recent forum posts</h3>
		<a class="head-link label-sm" href="/forum">
			Forum
			<ArrowRightIcon size={13} />
		</a>
	</header>

	{#if dash.isPending}
		<p class="empty text-sm">Loading&hellip;</p>
	{:else if error}
		<p class="empty text-sm error">{error}</p>
	{:else if posts.length === 0}
		<p class="empty text-sm">Nothing recent.</p>
	{:else}
		<ul class="list-card">
			{#each posts as post (post.id)}
				<li>
					<a class="list-row" href={post.thread.url}>
						<span class="dot"></span>
						<div class="body">
							<p class="preview text-sm">{post.preview}</p>
							<div class="meta text-xs">
								<span class="author">{displayName(post.user)}</span>
								in {post.thread.name}
							</div>
						</div>
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
		background: var(--color-info-700);
		flex: none;
	}

	.dot {
		width: 7px;
		height: 7px;
		margin-top: 6px;
		border-radius: var(--radius-sm);
		background: var(--color-info-700);
		flex: none;
	}

	.body {
		min-width: 0;
		flex: 1;
	}

	.preview {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.list-row:hover .preview {
		color: var(--color-primary);
	}

	.meta {
		margin-top: 2px;
		color: var(--color-text-tertiary);
	}

	.author {
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.empty {
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-error);
	}
</style>
