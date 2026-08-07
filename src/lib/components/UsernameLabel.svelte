<script lang="ts">
	import { identity } from '$lib/profiles.svelte';
    import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';

	let {
		userId,
        showAdmin = false,
        showId = false,
	}: { userId: string; showAdmin?: boolean; showId?: boolean } = $props();

    let info = $derived(identity(userId));
</script>

<div class="username-label">
    <a class="name label-md" href="/users/{userId}">
        {info.name}
    </a>
    {#if showAdmin && info.isAdmin}
        <ShieldCheckIcon />
    {/if}
    {#if showId && info.showId}
        <span class="id text-sm">@{info.id}</span>
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

.username-label .id {
    color: var(--color-text-tertiary);
}
</style>
