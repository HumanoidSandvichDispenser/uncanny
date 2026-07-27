<script lang="ts" generics="T extends { ok: boolean; error?: string }">
	import type { Snippet } from 'svelte';
	import type { CreateQueryResult } from '@tanstack/svelte-query';
	import { queryError } from '$lib/query';

	let {
		query,
		loading,
		error,
		children
	}: {
		query: CreateQueryResult<T>;
		loading?: Snippet;
		error: Snippet<[string]>;
		children: Snippet<[T]>;
	} = $props();

	const message = $derived(queryError(query));
</script>

{#if query.isPending}
	{@render loading?.()}
{:else if message !== undefined}
	{@render error(message)}
{:else if query.isSuccess}
	{@render children(query.data)}
{/if}
