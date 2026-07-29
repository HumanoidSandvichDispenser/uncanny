<script lang="ts">
	import type { Inline, Mark, MarkType } from '$lib/ucp/ast';
	import Marks from './Marks.svelte';

	let { content }: { content: Inline[] } = $props();

	// outer -> inner nesting order (spoiler outermost so the whole run hides)
	const ORDER: MarkType[] = [
		'spoiler',
		'link',
		'color',
		'bold',
		'italic',
		'underline',
		'strike',
		'sub',
		'sup',
		'code'
	];

	function ordered(marks: Mark[]): Mark[] {
		return [...marks].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
	}
</script>

{#each content as node, i (i)}
	{#if node.type === 'hardBreak'}
		<br />
	{:else}
		<Marks marks={ordered(node.marks)} text={node.text} />
	{/if}
{/each}
