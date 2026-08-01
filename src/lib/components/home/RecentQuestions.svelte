<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { relativeTime } from '$lib/format';
	import { queryError } from '$lib/query';
	import { dashboardQueryOptions } from '$lib/dashboard';

	const dash = createQuery(() => dashboardQueryOptions());
	const error = $derived(queryError(dash));
	const questions = $derived(dash.data?.recentQuestions ?? []);
</script>

<section class="widget">
	<header class="head">
		<span class="tick"></span>
		<h3 class="label-xs title">Recent questions</h3>
	</header>

	{#if dash.isPending}
		<p class="empty text-sm">Loading&hellip;</p>
	{:else if error}
		<p class="empty text-sm error">{error}</p>
	{:else if questions.length === 0}
		<p class="empty text-sm">Nothing recent.</p>
	{:else}
		<ul class="list-card">
			{#each questions as q (q.id)}
				<li>
					<a class="list-row" href="/answer?queue={q.id}">
						<span class="dot"></span>
						<div class="body">
							<p class="preview text-sm">{q.preview}</p>
							<time class="when text-xs">{relativeTime(q.time)}</time>
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

	.tick {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-sm);
		background: var(--color-error-500);
		flex: none;
	}

	.dot {
		width: 7px;
		height: 7px;
		margin-top: 6px;
		border-radius: var(--radius-sm);
		background: var(--color-error-500);
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

	.when {
		display: block;
		margin-top: 2px;
		color: var(--color-text-tertiary);
	}

	.empty {
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-error);
	}
</style>
