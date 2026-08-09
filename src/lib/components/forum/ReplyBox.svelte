<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import UcpEditor from '$lib/ucp/editor/UcpEditor.svelte';

	let { threadId }: { threadId: number } = $props();

	const client = useQueryClient();

	let value = $state('');
	let editor: UcpEditor;

	const reply = createMutation(() => ({
		mutationFn: async (text: string) => {
			const res = await accounts.active!.client.forum.replyThread(text, threadId);
			if (!res.ok) {
				throw new Error(res.error ?? 'reply failed');
			}
		},

		onSuccess: () => {
			editor.clear();
			editor.focus();
			void client.invalidateQueries({ queryKey: ['forum', 'thread', threadId] });
		}
	}));

	function submit() {
		if (value.trim() === '' || reply.isPending) {
			return;
		}
		reply.mutate(value);
	}
</script>

<div class="reply-box">
	<UcpEditor
		bind:value
		bind:this={editor}
		placeholder="Write a reply&hellip;"
		disabled={reply.isPending}
		onSubmit={submit}
	/>
	<div class="actions">
		{#if reply.isError}
			<span class="text-sm error">{reply.error.message}</span>
		{/if}
		<button
			class="btn btn-primary"
			disabled={value.trim() === '' || reply.isPending}
			onclick={submit}
		>
			{reply.isPending ? 'Posting…' : 'Reply'}
		</button>
	</div>
</div>

<style>
	.reply-box {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-padding-md);
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-2);
	}

	.error {
		color: var(--color-error);
	}
</style>
