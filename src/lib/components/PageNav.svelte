<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getPageNav } from '$lib/nav.svelte';

	let {
		title = null,
		showTitle = true,
		controls = null
	}: {
		title?: string | null;

		/**
		 * Whether to show the title in the navbar.
		 *
		 * This only affects forcing the title as titles should normally be shown on
		 * mobile.
		 */
		showTitle?: boolean;

		/**
		 * Additional controls to the navbar, such as search or action buttons.
		 */
		controls?: Snippet | null;
	} = $props();

	const nav = getPageNav();

	$effect(() => {
		nav.title = title;
		nav.controls = controls;
		nav.showTitle = showTitle;
		return () => nav.reset();
	});
</script>
