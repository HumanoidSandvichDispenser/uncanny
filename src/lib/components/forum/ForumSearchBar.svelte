<script lang="ts">
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	let {
		value = $bindable(''),
		onsearch,
		onclear
	}: {
		value?: string;
		onsearch: () => void;
		onclear: () => void;
	} = $props();

	function submit(event: SubmitEvent) {
		event.preventDefault();
		onsearch();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && value.length > 0) {
			onclear();
		}
	}
</script>

<form class="search" onsubmit={submit}>
	<MagnifyingGlassIcon class="search-icon" />
	<input
		class="search-input"
		type="search"
		placeholder="Search posts&hellip;"
		bind:value
		onkeydown={onKeydown}
	/>
	{#if value.length > 0}
		<button type="button" class="clear" title="Clear search" onclick={onclear}>
			<XIcon />
		</button>
	{/if}
</form>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0 var(--space-3);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-full);
	}

	.search:focus-within {
		border-color: var(--color-primary);
	}

	.search :global(.search-icon) {
		flex-shrink: 0;
		color: var(--color-text-secondary);
	}

	.search-input {
		flex: 1;
		padding: var(--space-3) 0;
		background: transparent;
		border: none;
		color: var(--color-text);
	}

	.search-input:focus {
		outline: none;
	}

	.search-input::-webkit-search-cancel-button {
		display: none;
	}

	.clear {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: var(--space-1);
		background: transparent;
		border: none;
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.clear:hover {
		color: var(--color-text);
	}
</style>
