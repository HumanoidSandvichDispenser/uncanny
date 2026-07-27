<script lang="ts">
	import { page } from '$app/state';

	const id = $derived(page.params.id);
</script>

<main class="page">
	<h1>{id}</h1>
</main>

<style>
	.page {
		max-width: var(--width-content);
		margin: 0 auto;
		padding: var(--space-padding-xl);
	}
</style>
