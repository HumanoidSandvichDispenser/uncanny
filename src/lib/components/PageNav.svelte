<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getPageNav } from '$lib/nav.svelte';

	let {
		title = null,
		showTitle = true,
		controls = null,
		chrome = 'default'
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

		/**
		 * Set to 'none' to suppress the shared chrome (Navbar/MobileNav)
		 * entirely, for pages that render their own.
		 */
		chrome?: 'default' | 'none';
	} = $props();

	const nav = getPageNav();

	$effect(() => {
		nav.title = title;
		nav.controls = controls;
		nav.showTitle = showTitle;
		nav.chrome = chrome;
		return () => nav.reset();
	});
</script>
