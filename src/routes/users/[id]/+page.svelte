<script lang="ts">
	import { page } from '$app/state';
	import { displayName } from '$lib/profiles.svelte';
	import PageNav from '$lib/components/PageNav.svelte';
	import ProfileHeader from '$lib/components/profile/ProfileHeader.svelte';

	const id = $derived(page.params.id!);
</script>

<PageNav title={displayName(id)} />

<main class="page">
	<ProfileHeader userId={id} />
</main>

<style>
	.page {
		width: 100%;
		max-width: var(--width-content);
		margin: 0 auto;
		padding: var(--space-padding-xl);
	}

	@media (--mobile) {
		.page {
			padding: 0;
		}
	}
</style>
