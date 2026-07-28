<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import ForumSearchBar from '$lib/components/forum/ForumSearchBar.svelte';
	import ForumCategories from '$lib/components/forum/ForumCategories.svelte';
	import ForumSearchResults from '$lib/components/forum/ForumSearchResults.svelte';

	const term = $derived(page.url.searchParams.get('q')?.trim() ?? '');
	let draft = $state(page.url.searchParams.get('q')?.trim() ?? '');

	$effect(() => {
		draft = term;
	});

	const trimmed = $derived(draft.trim());
	const searchView = $derived(trimmed.length > 0);
	const pendingSearch = $derived(trimmed !== term);

	function commit(q: string) {
		const url = new URL(page.url);

		if (q.length > 0) {
			url.searchParams.set('q', q);
		} else {
			url.searchParams.delete('q');
		}

		goto(url, { keepFocus: true, noScroll: true });
	}

	function onsearch() {
		commit(trimmed);
	}

	function onclear() {
		draft = '';
		commit('');
	}
</script>

<main class="page">
	<header class="head">
		<h1>Forum</h1>
		<span class="text-sm sub">{searchView ? 'Search' : 'Categories'}</span>
	</header>

	<div class="bar">
		<ForumSearchBar bind:value={draft} {onsearch} {onclear} />
	</div>

	{#if searchView}
		<section class="body" in:fade={{ duration: 120 }}>
			{#if pendingSearch}
				<p class="text-sm sub">
					Press <kbd>Enter</kbd> to search for &ldquo;{trimmed}&rdquo;
				</p>
			{:else}
				<ForumSearchResults {term} />
			{/if}
		</section>
	{:else}
		<section class="body" in:fade={{ duration: 120 }}>
			<ForumCategories />
		</section>
	{/if}
</main>

<style>
	.page {
		width: 100%;
		max-width: var(--width-content);
		margin: 0 auto;
		padding: var(--space-padding-xl);
	}

	.head {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		margin-bottom: var(--space-padding-md);
	}

	.bar {
		margin-bottom: var(--space-padding-md);
	}

	.sub {
		color: var(--color-text-secondary);
	}

	kbd {
		padding: 1px var(--space-2);
		font-family: var(--font-mono, monospace);
		font-size: 0.85em;
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-sm);
	}
</style>
