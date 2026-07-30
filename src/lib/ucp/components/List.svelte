<script lang="ts">
	import type { List } from '$lib/ucp/ast';
	import Block from './Block.svelte';

	let { block }: { block: List } = $props();
</script>

<ul>
	{#each block.items as item, i (i)}
		<li>
			{#each item.content as child, j (j)}
				<Block block={child} />
			{/each}
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding-left: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	li {
		list-style: disc;
	}
</style>
