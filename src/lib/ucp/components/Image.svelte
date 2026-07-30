<script lang="ts">
	import type { Image } from '$lib/ucp/ast';

	let { block }: { block: Image } = $props();
</script>

<div class="image"><img src={block.url} alt="" /></div>

<style>
	.image img {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-md);
	}
</style>
