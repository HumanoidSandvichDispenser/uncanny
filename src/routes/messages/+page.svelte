<script lang="ts">
	import PageNav from '$lib/components/PageNav.svelte';
</script>

<PageNav title="Messages" />

<main class="placeholder">
	<p class="text-sm">Select a conversation.</p>
</main>

<style>
	.placeholder {
		padding: var(--space-padding-xl);
		color: var(--color-text-tertiary);
	}

	@media (--mobile) {
		.placeholder {
			display: none;
		}
	}
</style>
