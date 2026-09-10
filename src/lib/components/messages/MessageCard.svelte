<script lang="ts">
	import type { Message, MessageThreadMember } from '@sandvichxyz/pecans';
	import { resolve } from '$app/paths';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import UsernameLabel from '$lib/components/UsernameLabel.svelte';
	import { clockTime, fullDateTime, messageDateTime } from '$lib/format';
	import { messageSender } from '$lib/messageGroups';
	import Ucp from '$lib/ucp/components/Ucp.svelte';

	let {
		messages,
		members
	}: {
		messages: Message[];
		members: Map<number, MessageThreadMember>;
	} = $props();

	const first = $derived(messages[0]);
	const sender = $derived(messageSender(members.get(first.member), first.member));
</script>

<article class="group">
	{#each messages as message, i (message.id)}
		<div id="message-{message.id}" class="row">
			<div class="gutter">
				{#if i === 0}
					{#if sender.anon}
						<UserAvatar name={sender.avatar} size={40} />
					{:else}
						<a href={resolve('/users/[id]', { id: sender.userId })}>
							<UserAvatar name={sender.avatar} size={40} status />
						</a>
					{/if}
				{:else}
					<time
						class="stamp text-xs"
						datetime={new Date(message.time * 1000).toISOString()}
						title={fullDateTime(message.time)}
					>
						{clockTime(message.time)}
					</time>
				{/if}
			</div>

			<div class="content">
				{#if i === 0}
					<header class="meta">
						{#if sender.anon}
							{#if sender.userId}
								<UsernameLabel userId={sender.userId} isAnonymous showAdmin />
							{:else}
								<span class="name label-md">Anonymous</span>
							{/if}
						{:else}
							<UsernameLabel userId={sender.userId} showAdmin />
						{/if}
						<span class="text-xs sub" title={fullDateTime(first.time)}>
							{messageDateTime(first.time)}
						</span>
					</header>
				{/if}

				<div class="text">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<Ucp text={message.text} context="CHAT" />
				</div>
			</div>
		</div>
	{/each}
</article>

<style>
	.group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.row {
		display: flex;
		padding: var(--space-padding-xs) var(--space-padding-sm);
	}

	@media (hover: hover) {
		.row:hover {
			background: var(--color-surface-hover);
		}
	}

	.gutter {
		flex: none;
		width: var(--space-16);
		display: flex;
		justify-content: center;
	}

	.stamp {
		visibility: hidden;
		align-self: center;
		color: var(--color-text-tertiary);
	}

	.row:hover .stamp {
		visibility: visible;
	}

	.content {
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
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.sub {
		color: var(--color-text-secondary);
	}

	.text {
		overflow-wrap: anywhere;
		color: var(--color-text);
	}
</style>
