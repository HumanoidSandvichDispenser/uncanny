<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { accounts } from '$lib/accounts.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/assets/design-system.css';
	import '$lib/assets/components.css';

	let { children } = $props();

	const queryClient = new QueryClient();

	$effect(() => {
		if (!accounts.isAuthed && page.url.pathname !== '/login') {
			goto('/login');
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	<div class="app">
		{#if accounts.isAuthed}
			<Navbar />
		{/if}
		<div class="main">
			{@render children()}
		</div>
	</div>
</QueryClientProvider>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	.main {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
