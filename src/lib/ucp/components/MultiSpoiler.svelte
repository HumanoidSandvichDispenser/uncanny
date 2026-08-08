<script lang="ts">
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import type { MultiLineSpoiler } from '$lib/ucp/ast';
	import Block from './Block.svelte';

	let { block }: { block: MultiLineSpoiler } = $props();

	let revealed = $state(false);
</script>

<div class="mspoiler" class:revealed>
	<button
		type="button"
		class="mspoiler-toggle"
		aria-expanded={revealed}
		onclick={() => (revealed = !revealed)}
	>
		<CaretRightIcon class="caret" weight="bold" />
		<span class="label">{revealed ? 'Spoiler' : 'Spoiler (click to reveal)'}</span>
	</button>
	{#if revealed}
		<div class="mspoiler-content">
			{#each block.content as child, i (i)}
				<Block block={child} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.mspoiler {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-padding-sm);
		background: var(--color-surface-active);
		border-radius: var(--radius-md);
	}

	.mspoiler-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0;
		font-family: inherit;
		color: var(--color-text-secondary);
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
	}

	.mspoiler-toggle :global(.caret) {
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	.mspoiler.revealed .mspoiler-toggle :global(.caret) {
		transform: rotate(90deg);
	}

	.mspoiler-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
