<script lang="ts">
	import type { UcpContext } from '$lib/ucp/ast';
	import { parse } from '$lib/ucp/parse';
	import Block from './Block.svelte';

	let { text, context = 'FORUM' }: { text: string; context?: UcpContext } = $props();

	const doc = $derived(parse(text ?? '', context));
</script>

<div class="ucp-content">
	{#each doc.content as block, i (i)}
		<Block {block} />
	{/each}
</div>

<style>
	.ucp-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		color: var(--color-text);
		line-height: 1.55;
		overflow-wrap: anywhere;
	}
</style>
