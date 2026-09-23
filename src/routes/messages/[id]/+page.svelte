<script lang="ts">
	import { page } from '$app/state';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { threadQuery } from '$lib/messages';
	import { observeVisible } from '$lib/actions/observeVisible';
	import PageNav from '$lib/components/PageNav.svelte';
	import MessageCard from '$lib/components/messages/MessageCard.svelte';
	import MessageCardSkeleton from '$lib/components/messages/MessageCardSkeleton.svelte';
	import UcpEditor from '$lib/ucp/editor/UcpEditor.svelte';
	import MessageThreadHeader from '$lib/components/messages/MessageThreadHeader.svelte';
	import PaperPlaneRightIcon from 'phosphor-svelte/lib/PaperPlaneRightIcon';
	import GhostIcon from 'phosphor-svelte/lib/GhostIcon';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { accounts } from '$lib/accounts.svelte';
	import { displayName } from '$lib/profiles.svelte';

	const id = $derived(page.params.id!);

	const view = createInfiniteQuery(() => threadQuery(id));

	const pages = $derived(view.data?.pages ?? []);

	const failure = $derived(pages.find((p) => !p.ok));
	const error = $derived(
		view.isError
			? view.error.message
			: failure
				? (failure.error ?? 'Something went wrong.')
				: undefined
	);

	const header = $derived(pages.find((p) => p.header)?.header);
	const title = $derived(header?.title ?? 'Message');

	const members = $derived(new Map((header?.members ?? []).map((m) => [m.mid, m])));

	const youAnon = $derived(header?.members.some((m) => m.you && m.anon) ?? false);

	// per-reply: revealing is irreversible, so each thread starts anonymous
	let reveal = $state(false);
	const replyAnon = $derived(youAnon && !reveal);

	// pages run newest first, and each page is newest first too, so flattening
	// and reversing gives one chronological run
	const ordered = $derived([...pages.flatMap((p) => p.messages)].reverse());

	let scrollerEl = $state<HTMLElement>();
	let topEl = $state<HTMLElement>();

	$effect(() => {
		void id;
		scrollerEl?.scrollTo(0, 0);
		reveal = false;
	});

	function onTopVisible(visible: boolean) {
		if (visible) {
			void loadOlder();
		}
	}

	async function loadOlder() {
		if (!view.hasNextPage || view.isFetchingNextPage) {
			return;
		}

		await view.fetchNextPage();
	}
</script>

<PageNav {title} />

<div class="thread-page">
	<main class="thread" bind:this={scrollerEl}>
		{#if view.isPending}
			<div class="skeletons">
				<MessageCardSkeleton />
				<MessageCardSkeleton />
				<MessageCardSkeleton />
			</div>
		{:else if ordered.length === 0}
			<p class="empty text-sm" class:error>{error ?? 'No messages yet.'}</p>
		{:else}
			<div class="messages">
				{#each ordered as message (message.id)}
					<MessageCard {message} {members} />
				{/each}
			</div>

			{#if error}
				<p class="empty text-sm error">{error}</p>
			{/if}

			{#if view.hasNextPage}
				<button
					class="btn btn-secondary load label-sm"
					bind:this={topEl}
					use:observeVisible={onTopVisible}
					onclick={loadOlder}
					disabled={view.isFetchingNextPage}
				>
					{view.isFetchingNextPage ? 'Loading more messages...' : 'Load earlier messages'}
				</button>
			{:else if header}
				<MessageThreadHeader header={header} />
			{/if}
		{/if}
	</main>
	<div class="message-editor">
		<UcpEditor context="CHAT" --max-height="80vh">
			{#snippet topbar()}
				{#if header && accounts.activeId}
					<button
						type="button"
						class="identity label-sm"
						class:revealed={!replyAnon}
						disabled={!youAnon}
						title={youAnon ? 'Toggle whether this reply shows your name' : undefined}
						aria-pressed={youAnon ? !replyAnon : undefined}
						onclick={() => (reveal = !reveal)}
					>
						{#if replyAnon}
							<GhostIcon size={15} weight="fill" />
							Replying anonymously
						{:else}
							<UserAvatar name={accounts.activeId} size={15} />
							Replying as {displayName(accounts.activeId)}
						{/if}
					</button>
				{/if}
			{/snippet}
			{#snippet actions()}
				<button type="button" class="btn btn-accent label-sm">
					<PaperPlaneRightIcon size={15} weight="fill" />
					Reply
				</button>
			{/snippet}
		</UcpEditor>
	</div>
</div>

<style>
	.thread-page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.thread {
		display: flex;
		flex-direction: column-reverse;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		gap: var(--space-padding-xs);
	}

	.messages,
	.skeletons {
		display: flex;
		flex-direction: column;
		/*padding: var(--space-padding-xs) 0;*/
	}

	.skeletons {
		gap: var(--space-gap-xs);
	}

	.messages :global(.message:not(:last-child)) {
		border-bottom: var(--border-thin) solid var(--color-border);
	}

	.load {
		display: block;
		margin: 0 auto var(--space-padding-lg);
	}

	.empty {
		color: var(--color-text-tertiary);
	}

	.error {
		color: var(--color-error);
	}

	.message-editor {
		padding: 0 var(--space-padding-sm) var(--space-padding-sm);

		@media (--mobile){
			padding: 0;
		}
	}

	.message-editor :global(.ucp-editor) {
		box-shadow: var(--shadow-sm);
	}

	.identity {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-padding-xs);
		background-color: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-tertiary);
		cursor: pointer;
	}

	.identity.revealed {
		color: var(--color-text-secondary);
	}

	.identity:hover:not(:disabled) {
		background-color: var(--color-surface-hover);
	}

	.identity:disabled {
		cursor: default;
	}
</style>
