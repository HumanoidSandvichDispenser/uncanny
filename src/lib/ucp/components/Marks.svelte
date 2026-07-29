<script lang="ts">
	import type { Mark } from '$lib/ucp/ast';
	import Self from './Marks.svelte';

	let { marks, text }: { marks: Mark[]; text: string } = $props();

	const mark = $derived(marks[0]);
	const rest = $derived(marks.slice(1));

	let revealed = $state(false);
</script>

{#if marks.length === 0}
	{text}
{:else if mark.type === 'bold'}
	<strong><Self marks={rest} {text} /></strong>
{:else if mark.type === 'italic'}
	<em><Self marks={rest} {text} /></em>
{:else if mark.type === 'underline'}
	<u><Self marks={rest} {text} /></u>
{:else if mark.type === 'strike'}
	<s><Self marks={rest} {text} /></s>
{:else if mark.type === 'sub'}
	<sub><Self marks={rest} {text} /></sub>
{:else if mark.type === 'sup'}
	<sup><Self marks={rest} {text} /></sup>
{:else if mark.type === 'code'}
	<code class="code"><Self marks={rest} {text} /></code>
{:else if mark.type === 'color'}
	<span class="color color-{mark.color}"><Self marks={rest} {text} /></span>
{:else if mark.type === 'link'}
	<!-- external user-supplied URL, not an internal route; resolve() does not apply -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={mark.href} target="_blank" rel="noopener noreferrer"><Self marks={rest} {text} /></a>
{:else if mark.type === 'spoiler'}
	<span
		class="spoiler"
		class:revealed
		role="button"
		tabindex="0"
		onclick={() => (revealed = true)}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (revealed = true)}
	>
		<Self marks={rest} {text} />
	</span>
{/if}

<style>
	.color {
		color: var(--ucp-color);
	}

	.color:global(.color-red) {
		--ucp-color: #d95555;
	}

	.color:global(.color-orange) {
		--ucp-color: #e08a3c;
	}

	.color:global(.color-yellow) {
		--ucp-color: #d4b03a;
	}

	.color:global(.color-green) {
		--ucp-color: #5aa86b;
	}

	.color:global(.color-blue) {
		--ucp-color: #5a8fd9;
	}

	.color:global(.color-purple) {
		--ucp-color: #9a72d0;
	}

	.color:global(.color-pink) {
		--ucp-color: #d976b8;
	}

	.color:global(.color-brown) {
		--ucp-color: #a1785a;
	}

	.color:global(.color-gray) {
		--ucp-color: var(--color-text-secondary);
	}

	.color:global(.color-mauve) {
		--ucp-color: #b58ab5;
	}

	.color:global(.color-aqua) {
		--ucp-color: #4fb0b8;
	}

	.color:global(.color-maroon) {
		--ucp-color: #b0544f;
	}

	.color:global(.color-cyan) {
		--ucp-color: #4bb4c9;
	}

	.color:global(.color-lime) {
		--ucp-color: #8bc34a;
	}

	.code {
		padding: 0.1em 0.35em;
		font-family: var(--font-mono);
		font-size: 0.9em;
		background: var(--color-code-bg);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	a {
		color: var(--color-primary);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.spoiler {
		border-radius: var(--radius-sm);
		background: var(--color-text);
		color: transparent;
		cursor: pointer;
	}

	.spoiler.revealed {
		background: var(--color-surface-active);
		color: inherit;
		cursor: auto;
	}
</style>
