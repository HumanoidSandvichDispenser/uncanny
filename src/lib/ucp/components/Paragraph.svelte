<script lang="ts">
	import type { Paragraph } from '$lib/ucp/ast';
	import Inline from './Inline.svelte';

	let { block }: { block: Paragraph } = $props();
</script>

<p><Inline content={block.content} /></p>

<style>
	p {
		margin: 0;
	}
</style>
