<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { Tabs } from 'bits-ui';
	import type { FollowEntry } from '@sandvichxyz/pecans';
	import { createQuery } from '@tanstack/svelte-query';
	import { gotoDirection } from '$lib/transition';
	import { accounts } from '$lib/accounts.svelte';
	import { displayName } from '$lib/profiles.svelte';
	import { followsQuery, followersQuery } from '$lib/follows';
	import TabBar from '$lib/components/TabBar.svelte';
	import FollowRow from '$lib/components/follows/FollowRow.svelte';
	import FollowButton from '$lib/components/follows/FollowButton.svelte';
	import PageNav from '$lib/components/PageNav.svelte';

	type FollowTab = 'followers' | 'following' | 'mutuals';

	const TABS: { value: FollowTab; label: string }[] = [
		{ value: 'followers', label: 'Followers' },
		{ value: 'following', label: 'Following' },
		{ value: 'mutuals', label: 'Mutuals' }
	];

	const DEFAULT_TAB: FollowTab = 'followers';

	function isTab(value: string | null): value is FollowTab {
		return TABS.some((t) => t.value === value);
	}

	const param = $derived(page.url.searchParams.get('tab'));
	const tab = $derived<FollowTab>(isTab(param) ? param : DEFAULT_TAB);

	function selectTab(value: string) {
		if (!isTab(value) || value === tab) {
			return;
		}

		const url = new URL(page.url);

		if (value === DEFAULT_TAB) {
			url.searchParams.delete('tab');
		} else {
			url.searchParams.set('tab', value);
		}

		gotoDirection(url, { keepFocus: true, noScroll: true, replaceState: true }, 'none');
	}

	const follows = createQuery(() => followsQuery());
	const followers = createQuery(() => followersQuery());

	const followEntries = $derived(follows.data?.ok ? follows.data.follows : []);
	const followerEntries = $derived(followers.data?.ok ? followers.data.followers : []);
	const mutualEntries = $derived(followEntries.filter((entry) => entry.mutual));

	// a follower's `mutual` means they follow you back, not that you follow
	// them, so the button state comes from the follows list
	const followingIds = $derived(new Set(followEntries.map((entry) => entry.id)));

	const counts = $derived<Record<FollowTab, number>>({
		followers: followerEntries.length,
		following: followEntries.length,
		mutuals: mutualEntries.length
	});

	const entries = $derived.by(() => {
		switch (tab) {
			case 'followers':
				return followerEntries;
			case 'following':
				return followEntries;
			case 'mutuals':
				return mutualEntries;
		}
	});

	let visible = $state<FollowEntry[]>([]);
	let snapshotKey = $state('');

	$effect(() => {
		const key = `${tab}:${accounts.activeId}`;
		const live = entries;

		untrack(() => {
			if (key !== snapshotKey) {
				snapshotKey = key;
				visible = live;
				return;
			}

			const known = new Set(visible.map((entry) => entry.id));
			const added = live.filter((entry) => !known.has(entry.id));

			if (added.length > 0) {
				visible = [...visible, ...added];
			}
		});
	});
</script>

<PageNav title={accounts.active ? displayName(accounts.active.id) : 'Follows'} />

<main class="page">
	<Tabs.Root value={tab} onValueChange={selectTab}>
		<TabBar tabs={TABS}>
			{#snippet label(item)}
				<span class="count">{counts[item.value]}</span>
				{item.label}
			{/snippet}
		</TabBar>

		{#each TABS as item (item.value)}
			<Tabs.Content value={item.value}>
				<ul class="list-card">
					{#each visible as entry (entry.id)}
						<li>
							<FollowRow {entry}>
								{#snippet action(row)}
									<FollowButton userId={row.id} following={followingIds.has(row.id)} />
								{/snippet}
							</FollowRow>
						</li>
					{/each}
				</ul>
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</main>

<style>
	.page {
		width: 100%;
		max-width: var(--width-content);
		margin: 0 auto;
		padding: var(--space-padding-xl);
	}

	.page :global(.list-card) {
		margin-top: var(--space-padding-md);
	}

	.page :global(.tab .count) {
		font-weight: 600;
	}

	@media (--mobile) {
		.page {
			padding: 0;
		}

		.page :global(.tab-bar) {
			position: sticky;
			top: 0;
			z-index: var(--z-sticky);
			background: var(--color-bg-page);
		}

		.page :global(.list-card) {
			margin-top: 0;
			background: transparent;
			border: none;
			border-radius: 0;
		}

		.page :global(.list-card > li:not(:last-child)) {
			border-bottom-color: var(--color-border-light);
		}
	}
</style>
