<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { createQuery } from '@tanstack/svelte-query';
	import { inboxQuery } from '$lib/messages';
	import QueryState from '$lib/components/QueryState.svelte';

	let { children } = $props();

	const inbox = createQuery(() => inboxQuery());

	const selected = $derived(page.params.id !== undefined);
</script>

<div class="shell" class:selected>
	<aside class="list">
		<QueryState query={inbox}>
			{#snippet loading()}
				<p class="empty text-sm">Loading&hellip;</p>
			{/snippet}

			{#snippet error(message)}
				<p class="empty text-sm error">{message}</p>
			{/snippet}

			{#snippet children(data)}
				{#if data.messages.length === 0}
					<p class="empty text-sm">No messages yet.</p>
				{:else}
					<ul class="messages-list">
						{#each data.messages as message (message.id)}
							<li>
								<a
									class="message-row"
									class:selected={page.params.id === message.id}
									href={resolve('/messages/[id]', { id: message.id })}
								>
									<div class="body">
										<span class="header">
											<span class="subject label-md">
												{message.subject}
											</span>
											<time
												class="text-xs sub"
												datetime={new Date(message.time * 1000).toISOString()}
												title={new Date(message.time * 1000).toLocaleString()}
											>
												{new Date(message.time * 1000).toLocaleDateString()}
											</time>
										</span>
										<p class="preview text-sm">
											{message.preview}
										</p>
									</div>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			{/snippet}
		</QueryState>
	</aside>

	<section class="thread">
		{@render children()}
	</section>
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: var(--width-rail) minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		flex: 1;
		min-height: 0;
		width: 100%;
		max-height: 100vh;
		margin: 0 auto;
	}

	.list {
		overflow-y: scroll;
		padding: var(--space-padding-sm);
		border-right: var(--border-thin) solid var(--color-border);
	}

	.messages-list {
		display: flex;
		flex-direction: column;
		list-style: none;
	}

	.message-row {
		display: block;
		padding: var(--space-padding-sm);
		border-radius: var(--radius-md);
		text-decoration: none;
	}

	.message-row:hover,
	.message-row.selected {
		background: var(--color-surface-hover);
	}

	.thread {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.body {
		min-width: 0;
	}

	.header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.subject {
		color: var(--color-text);
	}

	.preview {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		color: var(--color-text-secondary);
	}

	.empty {
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-error);
	}

	@media (--mobile) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}

		.shell.selected .list {
			display: none;
		}

		.list {
			padding: 0;
			border-right: none;
		}

		.messages-list .message-row {
			border: none;
			border-radius: 0;
		}

		.messages-list .message-row {
			border-bottom-color: var(--color-border-light);
		}

		.empty {
			padding: var(--space-padding-md);
		}
	}
</style>
