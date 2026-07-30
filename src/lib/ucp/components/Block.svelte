<script lang="ts">
	import type { Block } from '$lib/ucp/ast';
	import Paragraph from './Paragraph.svelte';
	import Heading from './Heading.svelte';
	import Image from './Image.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import List from './List.svelte';
	import Table from './Table.svelte';
	import Quote from './Quote.svelte';
	import MultiSpoiler from './MultiSpoiler.svelte';

	let { block }: { block: Block } = $props();
</script>

{#if block.type === 'paragraph'}
	<Paragraph {block} />
{:else if block.type === 'heading'}
	<Heading {block} />
{:else if block.type === 'image'}
	<Image {block} />
{:else if block.type === 'codeBlock'}
	<CodeBlock {block} />
{:else if block.type === 'list'}
	<List {block} />
{:else if block.type === 'table'}
	<Table {block} />
{:else if block.type === 'quote'}
	<Quote {block} />
{:else if block.type === 'mspoiler'}
	<MultiSpoiler {block} />
{/if}
