<script lang="ts">
	import type { Table } from '$lib/ucp/ast';
	import Inline from './Inline.svelte';

	let { block }: { block: Table } = $props();
</script>

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

<style>
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
</style>
