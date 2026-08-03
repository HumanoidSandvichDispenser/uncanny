<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import SignOutIcon from 'phosphor-svelte/lib/SignOutIcon';
	import { accounts } from '$lib/accounts.svelte';
	import { getPageNav, navLinks, isActive } from '$lib/nav.svelte';
	import UserAvatar from './UserAvatar.svelte';

	const pageNav = getPageNav();

	const active = $derived(accounts.active);

	function switchTo(id: string) {
		accounts.switch(id);
	}

	function addAccount() {
		goto('/login');
	}

	async function logOut() {
		if (await accounts.logOut()) {
			goto('/login');
		}
	}
</script>

<header class="navbar">
	<a class="brand" href="/">uncanny</a>

	<nav class="nav">
		{#each navLinks as link (link.href)}
			<a
				class="link label-sm"
				class:active={isActive(link.href, page.url.pathname)}
				href={link.href}
				data-nav="replace"
				data-sveltekit-replacestate
			>
				{link.label}
			</a>
		{/each}
	</nav>

	<div class="pushed">
		{#if pageNav.showTitle && pageNav.title}
			<div class="pushed-inner" in:fade={{ duration: 120 }}>
				<span class="pushed-title">
					{pageNav.title}
				</span>
				{#if pageNav.controls}
					<div class="pushed-content">
						{@render pageNav.controls()}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if active}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="menu-trigger">
				<UserAvatar name={active.id} size={28} />
				<span class="label-sm">{active.username}</span>
				<CaretDownIcon size={14} weight="bold" />
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content class="menu" sideOffset={8} align="end">
					<DropdownMenu.Item class="menu-item" onSelect={() => goto(`/users/${active.id}`)}>
						<div class="identity">
							<UserAvatar name={active.id} size={32} />
							<div class="who">
								<span class="label-sm">{active.username}</span>
								<span class="text-xs sub">View profile</span>
							</div>
						</div>
					</DropdownMenu.Item>

					{#if accounts.others.length}
						<DropdownMenu.Separator class="menu-sep" />
						<DropdownMenu.Group>
							<DropdownMenu.GroupHeading class="menu-heading label-xs">
								Switch account
							</DropdownMenu.GroupHeading>
							{#each accounts.others as acc (acc.id)}
								<DropdownMenu.Item class="menu-item" onSelect={() => switchTo(acc.id)}>
									<UserAvatar name={acc.id} size={28} />
									<span class="label-sm">{acc.username}</span>
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Group>
					{/if}

					<DropdownMenu.Separator class="menu-sep" />
					<DropdownMenu.Item class="menu-item" onSelect={addAccount}>
						<PlusIcon size={16} class="menu-glyph" />
						<span class="label-sm">Add account</span>
					</DropdownMenu.Item>
					<DropdownMenu.Item class="menu-item" onSelect={logOut}>
						<SignOutIcon size={16} class="menu-glyph" />
						<span class="label-sm">Log out</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	{/if}
</header>

<style>
	.navbar {
		display: flex;
		align-items: center;
		gap: var(--space-5);
		padding: var(--space-3) var(--space-6);
		background: var(--color-bg-card);
		border-bottom: var(--border-thin) solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	/* Mobile uses the compact MobileNav (back + title + hamburger) instead. */
	@media (max-width: 640px) {
		.navbar {
			display: none;
		}
	}

	.brand {
		font: 600 18px var(--font-serif);
		line-height: 1;
		letter-spacing: -0.01em;
		color: var(--color-text);
	}

	.brand:hover {
		text-decoration: none;
	}

	.nav {
		display: flex;
		gap: var(--space-4);
	}

	.link {
		color: var(--color-text-secondary);
	}

	.link:hover,
	.link.active {
		color: var(--color-text);
		text-decoration: none;
	}

	.pushed {
		flex: 1;
		min-width: 0;
	}

	.pushed-inner {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
	}

	.pushed-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--color-text);
		font-size: var(--text-md);
		font-weight: 600;
	}

	.pushed-content {
		flex: none;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.identity {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-1);
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
