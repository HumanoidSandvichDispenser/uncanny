<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { Feature } from '@sandvichxyz/pecans';
	import { accounts } from '$lib/accounts.svelte';
	import { batched } from '$lib/batch';
	import { displayName, profileCache, profileStatus } from '$lib/profiles.svelte';
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

	const follows = createQuery(() => ({
		queryKey: ['follows', activeId],
		queryFn: () => batched(accounts.active!.client.profile.listFollows()),
		enabled: accounts.isAuthed
	}));

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
				<UserAvatar name={id} size={44} />
			</span>
			<span class="nm text-xs">{displayName(id)}</span>
		</a>
	{/each}

	{#if shownFollows.length > 0}
		<span class="divider" role="separator"></span>
	{/if}

	{#each onlineFollows as user (user.id)}
		<a class="cell" href="/users/{user.id}" title={displayName(user.id)}>
			<span class="ring plain">
				<UserAvatar name={user.id} size={44} status />
			</span>
			<span class="nm text-xs">{displayName(user.id)}</span>
		</a>
	{/each}

	{#each topOfflineFollows as user (user.id)}
		<a class="cell" href="/users/{user.id}" title={displayName(user.id)}>
			<span class="ring outline">
				<UserAvatar name={user.id} size={44} status />
			</span>
			<span class="nm text-xs">{displayName(user.id)}</span>
		</a>
	{/each}

	<span class="divider" role="separator"></span>

	<a class="cell follows" href="/follows">
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
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-full);
		padding: 2px;
	}

	.ring.has {
		background: linear-gradient(135deg, var(--color-accent-500), var(--color-error-500));
	}

	.ring.plain {
		background: var(--color-border);
	}

	.ring.dashed {
		border: 2px dashed var(--color-border);
		color: var(--color-text-tertiary);
	}

	.ring.outline {
		border: 1.5px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.ring.has :global(.avatar),
	.ring.plain :global(.avatar) {
		border: 2px solid var(--color-bg-card);
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
