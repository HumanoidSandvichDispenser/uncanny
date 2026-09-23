<script lang="ts">
	import { page } from '$app/state';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { threadQuery } from '$lib/messages';
	import { observeVisible } from '$lib/actions/observeVisible';
	import PageNav from '$lib/components/PageNav.svelte';
	import MessageCard from '$lib/components/messages/MessageCard.svelte';
	import MessageCardSkeleton from '$lib/components/messages/MessageCardSkeleton.svelte';
	import MessageThreadHeader from '$lib/components/messages/MessageThreadHeader.svelte';
	import MessageComposer from '$lib/components/messages/MessageComposer.svelte';

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

	// pages run newest first, and each page is newest first too, so flattening
	// and reversing gives one chronological run
	const ordered = $derived([...pages.flatMap((p) => p.messages)].reverse());

	let scrollerEl = $state<HTMLElement>();
	let topEl = $state<HTMLElement>();

	$effect(() => {
		void id;
		scrollerEl?.scrollTo(0, 0);
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
		{#if header}
			{#key id}
				<MessageComposer threadId={id} {youAnon} --max-height="80vh" />
			{/key}
		{/if}
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
</style>
