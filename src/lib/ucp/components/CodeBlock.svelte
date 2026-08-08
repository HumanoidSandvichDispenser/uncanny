<script lang="ts">
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import type { CodeBlock } from '$lib/ucp/ast';

	let { block }: { block: CodeBlock } = $props();

	let collapsed = $state(false);
</script>

<div class="code-block" class:collapsed>
	<button
		type="button"
		class="code-header"
		aria-expanded={!collapsed}
		onclick={() => (collapsed = !collapsed)}
	>
		<CaretRightIcon class="caret" weight="bold" />
		<span class="lang">{block.lang ?? 'code'}</span>
	</button>
	{#if !collapsed}
		<pre class="code-body"><code>{block.code}</code></pre>
	{/if}
</div>

<style>
	.code-block {
		background: var(--color-code-bg);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.code-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-1) var(--space-padding-sm);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		background: var(--color-surface);
		border: none;
		border-bottom: var(--border-thin) solid var(--color-border);
		text-align: left;
		cursor: pointer;
	}

	.code-block.collapsed .code-header {
		border-bottom: none;
	}

	.code-header :global(.caret) {
		flex-shrink: 0;
		transition: transform 0.15s ease;
		transform: rotate(90deg);
	}

	.code-block.collapsed .code-header :global(.caret) {
		transform: rotate(0deg);
	}

	.code-body {
		margin: 0;
		padding: var(--space-padding-sm);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.5;
		color: var(--color-text);
		overflow-x: auto;
		white-space: pre;
	}
</style>
