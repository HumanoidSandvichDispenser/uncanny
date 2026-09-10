<script lang="ts">
	import { page } from '$app/state';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { threadQuery } from '$lib/messages';
	import { groupMessages } from '$lib/messageGroups';
	import { observeVisible } from '$lib/actions/observeVisible';
	import PageNav from '$lib/components/PageNav.svelte';
	import MessageCard from '$lib/components/messages/MessageCard.svelte';
	import MessageCardSkeleton from '$lib/components/messages/MessageCardSkeleton.svelte';
	import UcpEditor from '$lib/ucp/editor/UcpEditor.svelte';

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

	// pages run newest first, and each page is newest first too, so flattening
	// and reversing gives one chronological run
	const ordered = $derived([...pages.flatMap((p) => p.messages)].reverse());
	const groups = $derived(groupMessages(ordered));

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

<main class="thread" bind:this={scrollerEl}>
	{#if view.isPending}
		<div class="skeletons">
			<MessageCardSkeleton />
			<MessageCardSkeleton grouped />
			<MessageCardSkeleton />
		</div>
	{:else if groups.length === 0}
		<p class="empty text-sm" class:error>{error ?? 'No messages yet.'}</p>
	{:else}
		<div class="message-editor">
			<UcpEditor context="CHAT" />
		</div>

		<div class="messages">
			{#each groups as group (group[0].id)}
				<MessageCard messages={group} {members} />
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
		{/if}
	{/if}
</main>

<style>
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
		gap: var(--space-gap-xs);
		/*padding: var(--space-padding-xs) 0;*/
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
</style>
