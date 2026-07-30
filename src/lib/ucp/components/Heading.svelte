<script lang="ts">
	import type { Heading } from '$lib/ucp/ast';
	import Inline from './Inline.svelte';

	let { block }: { block: Heading } = $props();
</script>

<h3 class="heading"><Inline content={block.content} /></h3>

<style>
	.heading {
		margin: 0;
		font-weight: 600;
		font-size: 1.15em;
		color: var(--color-text);
	}
</style>
