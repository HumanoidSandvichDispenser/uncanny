<script lang="ts">
	import { displayName, profileCache } from '$lib/profiles.svelte';
    import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';

	let {
		userId,
        showAdmin = false,
	}: { userId: string; showAdmin?: boolean } = $props();

    let isAdmin = $derived.by(() => {
        if (showAdmin) {
            return profileCache[userId]?.admin ?? false;
        }

        return false;
    });
</script>

<div class="username-label">
    <a class="name label-md" href="/users/{userId}">
        {displayName(userId)}
    </a>
    {#if isAdmin}
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
