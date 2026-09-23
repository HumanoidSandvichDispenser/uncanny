<script lang="ts">
	import type { Message, MessageThreadMember } from '@sandvichxyz/pecans';
	import { resolve } from '$app/paths';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import UsernameLabel from '$lib/components/UsernameLabel.svelte';
	import AnonMarker from '$lib/components/AnonMarker.svelte';
	import { fullDateTime, messageDateTime } from '$lib/format';
	import { messageSender } from '$lib/messageSender';
	import Ucp from '$lib/ucp/components/Ucp.svelte';

	let {
		message,
		members
	}: {
		message: Message;
		members: Map<number, MessageThreadMember>;
	} = $props();

	const sender = $derived(messageSender(members.get(message.member), message.member));

	// HACK:
	const body = $derived((message as Message & { text: string }).text);
</script>

<article id="message-{message.id}" class="message">
	<div class="who">
		{#if sender.anon}
			<UserAvatar name={sender.avatar} size={40} />
		{:else}
			<a href={resolve('/users/[id]', { id: sender.userId })}>
				<UserAvatar name={sender.avatar} size={40} status />
			</a>
		{/if}
	</div>

	<div class="body">
		<header class="meta">
			{#if sender.anon}
				{#if sender.userId}
					<UsernameLabel userId={sender.userId} isAnonymous showAdmin />
				{:else}
					<span class="anon-name">
						<span class="name label-md">Anonymous</span>
						<AnonMarker />
					</span>
				{/if}
			{:else}
				<UsernameLabel userId={sender.userId} showAdmin />
			{/if}
			<time
				class="text-xs date"
				datetime={new Date(message.time * 1000).toISOString()}
				title={fullDateTime(message.time)}
			>
				{messageDateTime(message.time)}
			</time>
		</header>

		<div class="text">
			<Ucp text={body} context="CHAT" />
		</div>
	</div>
</article>

<style>
	.message {
		display: flex;
		gap: var(--space-gap-sm);
		padding: var(--space-padding-md) var(--space-padding-sm);
	}

	.who {
		flex: none;
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

	.anon-name {
		display: flex;
		align-items: center;
		gap: var(--space-gap-xs);
	}

	.name {
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.date {
		color: var(--color-text-secondary);
	}

	.text {
		overflow-wrap: anywhere;
		color: var(--color-text);
	}
</style>
