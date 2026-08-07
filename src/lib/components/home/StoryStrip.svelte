<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { Feature } from '@sandvichxyz/pecans';
	import { accounts } from '$lib/accounts.svelte';
	import { batched } from '$lib/batch';
	import { displayName, profileCache, profileStatus } from '$lib/profiles.svelte';
	import { followsQuery } from '$lib/follows';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';

	const activeId = $derived(accounts.activeId);

	const stories = createQuery(() => ({
		queryKey: ['stories', activeId],
		queryFn: () => batched(accounts.active!.client.stories.viewList()),
		enabled: accounts.isAuthed,
		staleTime: 30_000
	}));

	const follows = createQuery(() => followsQuery());

	const online = createQuery(() => ({
		queryKey: ['online', 'forum', activeId],
		queryFn: () => batched(accounts.active!.client.notify.fetchOnlineUsers(Feature.FORUM)),
		enabled: accounts.isAuthed,
		staleTime: 30_000
	}));

	const storyUsers = $derived([
		...new Set(stories.data?.stories.map((s) => s.userId) ?? [])
	]);

	const sortedFollows = $derived.by(() => {
		return follows.data?.follows
			.sort((a, b) => {
				return profileCache[b.id]?.online - profileCache[a.id]?.online;
			});
	});

	const onlineFollows = $derived.by(() => {
		return sortedFollows
			?.filter((f) => {
				const status = profileStatus(f.id);
				return status === 'online' || status === 'recent';
			});
	});

	const topOfflineFollows = $derived.by(() => {
		// show up to 10 follows if online follows are less than 10
		return sortedFollows
			?.filter((f) => {
				const status = profileStatus(f.id);
				return status === 'offline'
			})
			.slice(0, 10 - (onlineFollows?.length ?? 0));
	});

	const shownFollows = $derived.by(() => {
		return [
			...(onlineFollows ?? []),
			...(topOfflineFollows ?? [])
		];
	});
</script>

<section class="strip" aria-label="Stories and followed users">
	<!-- Add to your story -->
	<button type="button" class="cell add" aria-label="Add to your story">
		<span class="ring dashed">
			<PlusIcon size={20} />
		</span>
		<span class="nm text-xs">You</span>
	</button>

	{#each storyUsers as id (id)}
		<a class="cell" href="/stories/{id}" title={displayName(id)}>
			<span class="ring has">
				<UserAvatar name={id} size={40} />
			</span>
			<span class="nm text-xs">{displayName(id)}</span>
		</a>
	{/each}

	{#if shownFollows.length > 0}
		<span class="divider" role="separator"></span>
	{/if}

	{#each onlineFollows as user (user.id)}
		<a class="cell" href="/users/{user.id}" title={displayName(user.id)}>
			<span class="ring outline">
				<UserAvatar name={user.id} size={40} status />
			</span>
			<span class="nm text-xs">{displayName(user.id)}</span>
		</a>
	{/each}

	{#each topOfflineFollows as user (user.id)}
		<a class="cell" href="/users/{user.id}" title={displayName(user.id)}>
			<span class="ring outline">
				<UserAvatar name={user.id} size={40} status />
			</span>
			<span class="nm text-xs">{displayName(user.id)}</span>
		</a>
	{/each}

	<span class="divider" role="separator"></span>

	<a class="cell follows" href="/follows?tab=following">
		<span class="ring outline">
			<span class="followers-icon">
				<UsersIcon size={18} />
				<span class="text-xs count">
					{#if follows.data && follows.data.follows.length > 0}
						+{follows.data.follows.length - shownFollows.length}
					{/if}
				</span>
			</span>
		</span>
		<span class="nm text-xs">
			Follows
		</span>
	</a>
</section>

<style>
	.strip {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		overflow-x: auto;

		@media (--mobile) {
			/*
			 * break out of parent's padding to make the strip edge-to-edge on mobile
			 */
			margin-inline: calc(-1 * var(--space-padding-sm));
			padding-inline: var(--space-padding-sm);

			&::-webkit-scrollbar {
				display: none;
			}
		}
	}

	.cell {
		flex: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		width: 3.5rem;
		border: none;
		background: none;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.cell:hover {
		text-decoration: none;
	}

	.ring {
		position: relative;
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-full);
	}

	/*
	 * gradient/solid rings are a masked pseudo-element: the center is punched
	 * out so the gap between ring and avatar is real transparency. no more
	 * faking it with a card-colored avatar border, so it works on any
	 * background.
	 */
	.ring.has::before,
	.ring.plain::before {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: var(--radius-full);
		padding: 3px;
		pointer-events: none;
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
	}

	.ring.has::before {
		background: linear-gradient(135deg, var(--color-accent-500), var(--color-error-500));
	}

	.ring.plain::before {
		background: var(--color-border);
	}

	.ring.dashed {
		border: 2px dashed var(--color-border);
		color: var(--color-text-tertiary);
	}

	.ring.outline {
		border: 2px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	/* status-dot halo defaults to bg-card (right for card contexts like
	   PostCard); on the strip the surface is the page background */
	.ring :global(.status-dot) {
		box-shadow: 0 0 0 2px var(--color-bg-page);
	}

	.followers-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		font-size: 0.75rem;
	}

	.followers-icon .count {
		font-size: 0.625rem;
		color: var(--color-text-secondary);
	}

	.nm {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.divider {
		flex: none;
		align-self: stretch;
		width: 1px;
		margin: 0 var(--space-1);
		background: var(--color-border);
	}
</style>
