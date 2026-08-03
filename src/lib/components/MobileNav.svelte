<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import SignOutIcon from 'phosphor-svelte/lib/SignOutIcon';
	import { accounts } from '$lib/accounts.svelte';
	import { getPageNav, navHistory, navLinks, isActive } from '$lib/nav.svelte';
	import UserAvatar from './UserAvatar.svelte';

	const pageNav = getPageNav();

	let open = $state(false);

	const active = $derived(accounts.active);

	function switchTo(id: string) {
		accounts.switch(id);
		open = false;
	}

	function addAccount() {
		open = false;
		goto('/login');
	}

	async function logOut() {
		open = false;
		if (await accounts.logOut()) {
			goto('/login');
		}
	}
</script>

<header class="mobile-nav">
	{#if navHistory.canGoBack}
		<button class="btn btn-icon" onclick={() => history.back()} aria-label="Back">
			<CaretLeftIcon size={22} weight="bold" />
		</button>
	{/if}

	<span class="title">{pageNav.title ?? ''}</span>

	{#if pageNav.controls}
		<div class="controls">{@render pageNav.controls()}</div>
	{/if}

	<Dialog.Root bind:open>
		<Dialog.Trigger class="btn btn-icon" aria-label="Menu">
			<ListIcon size={22} weight="bold" />
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay class="drawer-backdrop" />
			<Dialog.Content class="drawer">
				<nav class="drawer-nav">
					{#each navLinks as link (link.href)}
						<a
							class="drawer-link label-md"
							class:active={isActive(link.href, page.url.pathname)}
							href={link.href}
							data-nav="replace"
							data-sveltekit-replacestate
							onclick={() => (open = false)}
						>
							{link.label}
						</a>
					{/each}
				</nav>

				{#if active}
					<div class="drawer-sep"></div>

					<a
						class="account"
						href="/users/{active.id}"
						onclick={() => (open = false)}
					>
						<UserAvatar name={active.id} size={36} />
						<div class="who">
							<span class="label-md">{active.username}</span>
							<span class="text-xs sub">View profile</span>
						</div>
					</a>

					{#each accounts.others as acc (acc.id)}
						<button class="drawer-item label-sm" onclick={() => switchTo(acc.id)}>
							<UserAvatar name={acc.id} size={28} />
							<span>{acc.username}</span>
						</button>
					{/each}

					<button class="drawer-item label-sm" onclick={addAccount}>
						<PlusIcon size={20} />
						<span>Add account</span>
					</button>
					<button class="drawer-item label-sm" onclick={logOut}>
						<SignOutIcon size={20} />
						<span>Log out</span>
					</button>
				{/if}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</header>

<style>
	.mobile-nav {
		display: none;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-card);
		border-bottom: var(--border-thin) solid var(--color-border);
	}

	@media (--mobile) {
		.mobile-nav {
			display: flex;
		}
	}

	.title {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--text-md);
		font-weight: 600;
		color: var(--color-text);
	}

	.controls {
		flex: none;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	/* The Dialog is rendered in a portal, so these selectors must be global.
	   bits-ui sets data-state open/closed and waits for these animations before
	   unmounting, giving us enter/exit transitions for free. */
	:global(.drawer-backdrop) {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal, 100);
		background: color-mix(in srgb, black 40%, transparent);
	}

	:global(.drawer-backdrop[data-state='open']) {
		animation: fade-in var(--duration-standard, 200ms) var(--ease-out, ease);
	}

	:global(.drawer-backdrop[data-state='closed']) {
		animation: fade-out var(--duration-standard, 200ms) var(--ease-out, ease);
	}

	:global(.drawer) {
		position: fixed;
		inset: 0 0 0 auto;
		z-index: var(--z-modal, 100);
		width: min(80vw, 320px);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-4);
		padding-top: max(var(--space-4), env(safe-area-inset-top));
		background: var(--color-bg-card);
		border-left: var(--border-thin) solid var(--color-border);
		overflow-y: auto;
	}

	:global(.drawer[data-state='open']) {
		animation: slide-in-right var(--duration-slow, 300ms) var(--ease-out, ease);
	}

	:global(.drawer[data-state='closed']) {
		animation: slide-out-right var(--duration-standard, 200ms) var(--ease-out, ease);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.drawer[data-state='open']),
		:global(.drawer[data-state='closed']),
		:global(.drawer-backdrop[data-state='open']),
		:global(.drawer-backdrop[data-state='closed']) {
			animation: none;
		}
	}

	/* The drawer slide (slide-in/out-right) and backdrop fade (fade-in/out)
	   keyframes are all defined globally in the root layout. */

	.drawer-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.drawer-link,
	.drawer-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		color: var(--color-text);
		text-align: left;
		background: transparent;
		width: 100%;
	}

	.drawer-link.active {
		background: var(--color-surface-hover);
	}

	.drawer-link:active,
	.drawer-item:active,
	.account:active {
		background: var(--color-surface-hover);
	}

	.drawer-sep {
		height: var(--border-thin);
		background: var(--color-border);
		margin: var(--space-2) 0;
	}

	.account {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		border-radius: var(--radius-md);
		color: var(--color-text);
	}

	.who {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.sub {
		color: var(--color-text-tertiary);
	}
</style>
