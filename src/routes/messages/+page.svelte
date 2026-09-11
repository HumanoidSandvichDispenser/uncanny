<script lang="ts">
	import PageNav from '$lib/components/PageNav.svelte';
</script>

<PageNav title="Messages" />

<main class="placeholder">
	<p class="text-sm">Select a conversation.</p>
</main>

<style>
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-tertiary);
		width: 100%;
		height: 100%;
	}

	.placeholder p {
		color: var(--color-text-tertiary);
	}

	@media (--mobile) {
		.placeholder {
			display: none;
		}
	}
</style>
