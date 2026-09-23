<script lang="ts">
	import { resolve } from '$app/paths';
	import { identity } from '$lib/profiles.svelte';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import GhostIcon from 'phosphor-svelte/lib/GhostIcon';

	let {
		userId,
		showAdmin = false,
		isAnonymous = false
	}: { userId: string; showAdmin?: boolean; isAnonymous?: boolean } = $props();

	let info = $derived(identity(userId));
</script>

<div class="username-label">
	<a class="name label-md" href={resolve('/users/[id]', { id: userId })}>
		{info.name}
	</a>
	{#if isAnonymous}
		<GhostIcon />
	{/if}
	{#if showAdmin && info.isAdmin}
		<ShieldCheckIcon />
	{/if}
</div>

<style>
	.username-label {
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		gap: var(--space-gap-xs);
	}

	.username-label a {
		color: var(--color-text-secondary);
		font-weight: 600;
	}
</style>
