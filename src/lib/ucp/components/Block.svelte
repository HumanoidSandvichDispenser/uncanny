<script lang="ts">
	import { displayName } from '$lib/profiles.svelte';
	import type { Block } from '$lib/ucp/ast';
	import Inline from './Inline.svelte';
	import Self from './Block.svelte';

	let { block }: { block: Block } = $props();

	// multi-line spoiler reveal state (only meaningful when block is an mspoiler)
	let revealed = $state(false);
</script>

{#if block.type === 'paragraph'}
	<p><Inline content={block.content} /></p>
{:else if block.type === 'heading'}
	<h3 class="heading"><Inline content={block.content} /></h3>
{:else if block.type === 'image'}
	<div class="image"><img src={block.url} alt="" /></div>
{:else if block.type === 'codeBlock'}
	<pre class="code-block"><code>{block.code}</code></pre>
{:else if block.type === 'list'}
	<ul>
		{#each block.items as item, i (i)}
			<li>
				{#each item.content as child, j (j)}
					<Self block={child} />
				{/each}
			</li>
		{/each}
	</ul>
{:else if block.type === 'table'}
	<div class="table-wrap">
		<table>
			{#if block.header}
				<thead>
					<tr>
						{#each block.header.cells as cell, i (i)}
							<th style:text-align={block.align[i] ?? 'left'}>
								<Inline content={cell.content} />
							</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody>
				{#each block.rows as row, i (i)}
					<tr>
						{#each row.cells as cell, j (j)}
							<td style:text-align={block.align[j] ?? 'left'}>
								<Inline content={cell.content} />
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if block.type === 'quote'}
	<div class="quote">
		{#if block.source}
			<div class="quote-source">
				{#if block.source.kind === 'user'}
					{displayName(block.source.id)} said…
				{:else}
					Quote from <strong>{block.source.text}</strong>
				{/if}
			</div>
		{/if}
		<div class="quote-content">
			{#each block.content as child, i (i)}
				<Self block={child} />
			{/each}
		</div>
	</div>
{:else if block.type === 'mspoiler'}
	<div
		class="mspoiler"
		class:revealed
		role="button"
		tabindex="0"
		onclick={() => (revealed = true)}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (revealed = true)}
	>
		{#each block.content as child, i (i)}
			<Self block={child} />
		{/each}
	</div>
{/if}

<style>
	p {
		margin: 0;
	}

	.heading {
		margin: 0;
		font-weight: 600;
		font-size: 1.15em;
		color: var(--color-text);
	}

	.image img {
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-md);
	}

	.code-block {
		margin: 0;
		padding: var(--space-padding-sm);
		font-family: var(--font-mono);
		font-size: 0.9em;
		line-height: 1.5;
		color: var(--color-text);
		background: var(--color-code-bg);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		overflow-x: auto;
		white-space: pre;
	}

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

	.table-wrap {
		overflow-x: auto;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	th,
	td {
		padding: var(--space-2) var(--space-3);
		border: var(--border-thin) solid var(--color-border);
	}

	thead {
		background: var(--color-surface);
		font-weight: 600;
	}

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
		font-size: 0.85em;
		color: var(--color-text-secondary);
	}

	.quote-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.mspoiler {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-padding-sm);
		background: var(--color-surface-active);
		border-radius: var(--radius-md);
		color: transparent;
		cursor: pointer;
		filter: blur(6px);
		user-select: none;
	}

	.mspoiler.revealed {
		color: inherit;
		cursor: auto;
		filter: none;
		user-select: auto;
	}
</style>
