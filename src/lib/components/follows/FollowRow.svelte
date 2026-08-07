<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { FollowEntry } from '@sandvichxyz/pecans';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import { identity } from '$lib/profiles.svelte';

	let {
		entry,
		action
	}: {
		entry: FollowEntry;
		action?: Snippet<[FollowEntry]>;
	} = $props();

	const info = $derived(identity(entry.id));
</script>

<div class="row">
	<a class="who" href="/users/{entry.id}">
		<UserAvatar name={entry.id} size={44} status />
		<span class="text">
			<span class="name label-md">
				{info.name}
				{#if info.isAdmin}
					<ShieldCheckIcon />
				{/if}
			</span>
			{#if info.showId}
				<span class="id text-sm">@{info.id}</span>
			{/if}
		</span>
	</a>

	{#if action}
		<span class="action">
			{@render action(entry)}
		</span>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-gap-sm);
		padding: var(--space-padding-sm);
	}

	.who {
		display: flex;
		align-items: center;
		gap: var(--space-gap-sm);
		flex: 1;
		min-width: 0;
		color: var(--color-text);
	}

	.who:hover {
		text-decoration: none;
	}

	.text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.name,
	.id {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		display: flex;
		align-items: center;
		gap: var(--space-gap-xs);
		font-weight: 600;
	}

	.id {
		color: var(--color-text-secondary);
	}

	.action {
		flex-shrink: 0;
	}
</style>
