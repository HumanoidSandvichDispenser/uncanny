<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import { displayName } from '$lib/profiles.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import UcpEditor from '$lib/ucp/editor/UcpEditor.svelte';
	import GhostIcon from 'phosphor-svelte/lib/GhostIcon';
	import PaperPlaneRightIcon from 'phosphor-svelte/lib/PaperPlaneRightIcon';

	let {
		threadId,
		youAnon,
		onSent
	}: {
		threadId: string;
		youAnon: boolean;
		onSent?: () => void;
	} = $props();

	const client = useQueryClient();

	let editor = $state<UcpEditor>();
	let text = $state('');

	// per-reply: revealing is irreversible, so every reply starts anonymous
	let reveal = $state(false);
	const replyAnon = $derived(youAnon && !reveal);

	const reply = createMutation(() => ({
		mutationFn: async ({ text, unanonymize }: { text: string; unanonymize: boolean }) => {
			const res = await accounts.active!.client.messages.reply(threadId, text, unanonymize);
			if (!res.ok) {
				throw new Error(res.error ?? 'Could not send your reply.');
			}
		},

		onSuccess: () => {
			editor?.clear();
			editor?.focus();
			reveal = false;
			void client.invalidateQueries({ queryKey: ['messages', 'thread', threadId] });
			void client.invalidateQueries({ queryKey: ['messages', 'inbox'] });
			onSent?.();
		}
	}));

	function send() {
		if (text.trim() === '' || reply.isPending) {
			return;
		}

		reply.mutate({ text, unanonymize: youAnon && !replyAnon });
	}
</script>

<UcpEditor
	bind:this={editor}
	bind:value={text}
	context="CHAT"
	disabled={reply.isPending}
	onSubmit={send}
>
	{#snippet topbar()}
		{#if accounts.activeId}
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
		{#if reply.isError}
			<span class="error text-xs">{reply.error.message}</span>
		{/if}
	{/snippet}
	{#snippet actions()}
		<button
			type="button"
			class="btn btn-accent label-sm"
			onclick={send}
			disabled={reply.isPending || text.trim() === ''}
		>
			<PaperPlaneRightIcon size={15} weight="fill" />
			Reply
		</button>
	{/snippet}
</UcpEditor>

<style>
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

	.error {
		align-self: center;
		color: var(--color-error);
	}
</style>
