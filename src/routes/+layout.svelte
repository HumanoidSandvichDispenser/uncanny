<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { goto, onNavigate } from '$app/navigation';
	import { takeDirection, setActiveTransition, type Direction } from '$lib/transition';
	import { accounts } from '$lib/accounts.svelte';
	import { PageNav, setPageNav, navHistory } from '$lib/nav.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import '$lib/assets/design-system.css';
	import '$lib/assets/components.css';

	let { children } = $props();

	let mainEl = $state<HTMLElement>();
	const mainScroll = new Map<string, number>();

	const queryClient = new QueryClient();

	// Routes can push a title/controls into the navbar via this shared store.
	const pageNav = new PageNav();
	setPageNav(pageNav);

	$effect(() => {
		if (!accounts.isAuthed && page.url.pathname !== '/login') {
			goto('/login');
		}
	});

	// for desktop, chunked JS is fetched on link hover, but for mobile, we
	// want to preload on viewport entry instead
	$effect(() => {
		const mobile = window.matchMedia('(width < 640px)');

		const apply = () => {
			if (mobile.matches) {
				document.body.dataset.sveltekitPreloadCode = 'viewport';
			} else {
				delete document.body.dataset.sveltekitPreloadCode;
			}
		};

		apply();
		mobile.addEventListener('change', apply);

		return () => mobile.removeEventListener('change', apply);
	});

	onNavigate((navigation) => {
		let from: Direction | null = null;

		if (navigation.type === 'link') {
			const a = (navigation.event.target as Element)?.closest('a[data-nav]');
			if (a) {
				from = a.getAttribute('data-nav') as Direction;
			}
		}

		const direction =
			from ??
			takeDirection() ??
			(navigation.type === 'popstate' && (navigation.delta ?? 0) < 0 ? 'back' : 'forward');

		if (navigation.type === 'popstate') {
			navHistory.depth = Math.max(0, navHistory.depth + (navigation.delta ?? 0));
		} else if (direction !== 'replace') {
			navHistory.depth += 1;
		}

		if (!document.startViewTransition || direction === 'none') {
			return;
		}

		document.documentElement.dataset.nav = direction;

		const fromKey = navigation.from?.url.href;

		if (mainEl && fromKey) {
			mainScroll.set(fromKey, mainEl.scrollTop);
		}

		const toKey = navigation.to?.url.href;

		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;

				if (mainEl) {
					let restore: number | undefined;
					if (navigation.type === 'popstate' && toKey) {
						restore = mainScroll.get(toKey);
					}

					mainEl.scrollTop = restore ?? 0;
				}
			});

			transition.ready.catch(() => {});

			const finished = transition.finished.catch(() => {}).finally(() => {
				delete document.documentElement.dataset.nav;
			});

			setActiveTransition(finished);
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	<div class="app">
		{#if accounts.isAuthed && pageNav.chrome === 'default'}
			<Navbar />
			<MobileNav />
		{/if}
		<div class="main" bind:this={mainEl}>
			{@render children()}
		</div>
	</div>
</QueryClientProvider>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>

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

	/* By default (desktop) routes swap instantly — no page animation. */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation: none;
	}

	@media (max-width: 640px) {
		:global(html),
		:global(body) {
			height: 100dvh;
			overflow: hidden;
		}

		.app {
			height: 100%;
			min-height: 0;
		}

		.main {
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
		}

		.main::-webkit-scrollbar {
			display: none;
		}

		:global(::view-transition-group(root)) {
			animation-duration: var(--duration-standard, 200ms);
			animation-timing-function: var(--ease-out, ease);
		}

		:global(html[data-nav='forward']::view-transition-new(root)) {
			animation: slide-in-bottom var(--duration-slow) var(--ease-out) both;
		}

		:global(html[data-nav='back']::view-transition-old(root)) {
			animation: slide-out-bottom var(--duration-slow) var(--ease-out) both;
			z-index: 1;
		}

		:global(html[data-nav='back']::view-transition-new(root)) {
			animation: none;
			z-index: 0;
		}

		/* Tab switches replace the stack — no slide, just a quick crossfade. */
		:global(html[data-nav='replace']::view-transition-old(root)) {
			animation: fade-out var(--duration-fast) var(--ease-out) both;
		}

		:global(html[data-nav='replace']::view-transition-new(root)) {
			animation: fade-in var(--duration-fast) var(--ease-out) both;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none !important;
		}
	}

	@keyframes -global-slide-in-right {
		from {
			transform: translateX(100%);
		}
	}

	@keyframes -global-slide-out-left {
		to {
			transform: translateX(-25%);
		}
	}

	@keyframes -global-slide-in-left {
		from {
			transform: translateX(-25%);
		}
	}

	@keyframes -global-slide-out-right {
		to {
			transform: translateX(100%);
		}
	}

	@keyframes -global-slide-in-bottom {
		from {
			transform: translateY(100%);
		}
	}

	@keyframes -global-slide-out-bottom {
		to {
			transform: translateY(100%);
		}
	}

	@keyframes -global-slide-out-up {
		to {
			transform: translateY(-25%);
		}
	}

	@keyframes -global-slide-in-top {
		from {
			transform: translateY(-25%);
		}
	}

	@keyframes -global-slide-out-down {
		to {
			transform: translateY(100%);
		}
	}

	@keyframes -global-fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes -global-fade-out {
		to {
			opacity: 0;
		}
	}
</style>
