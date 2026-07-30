<script lang="ts">
	import { displayName } from '$lib/profiles.svelte';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import type { Quote } from '$lib/ucp/ast';
	import Block from './Block.svelte';
	import { getQuoteDepth, setQuoteDepth } from './context';

	let { block }: { block: Quote } = $props();

	const depth = getQuoteDepth() + 1;
	setQuoteDepth(depth);

	// by default, collapse quotes that are nested 2 or more levels deep
	let collapsed = $state(depth >= 2);
</script>

<div class="quote" class:collapsed>
	<button
		type="button"
		class="quote-source"
		aria-expanded={!collapsed}
		onclick={() => (collapsed = !collapsed)}
	>
		<CaretRightIcon class="caret" weight="bold" />
		<span class="label">
			{#if block.source}
				{#if block.source.kind === 'user'}
					{displayName(block.source.id)} said…
				{:else}
					Quote from <strong>{block.source.text}</strong>
				{/if}
			{:else}
				Quote
			{/if}
		</span>
	</button>
	{#if !collapsed}
		<div class="quote-content">
			{#each block.content as child, i (i)}
				<Block block={child} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.quote {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-padding-sm);
		background: var(--color-surface);
		border-left: var(--border-left-thick) solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.quote-source {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0;
		font-size: 0.85em;
		font-family: inherit;
		color: var(--color-text-secondary);
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
	}

	.quote-source :global(.caret) {
		flex-shrink: 0;
		transition: transform 0.15s ease;
		transform: rotate(90deg);
	}

	.quote.collapsed .quote-source :global(.caret) {
		transform: rotate(0deg);
	}

	.quote-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
</style>
