<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import type { ListFollowsResponse, ProfileGetResponse } from '@sandvichxyz/pecans';
	import { accounts } from '$lib/accounts.svelte';

	let {
		userId,
		following
	}: {
		userId: string;

		/**
		 * Whether the active account currently follows this user.
		 */
		following: boolean;
	} = $props();

	const client = useQueryClient();

	const toggle = createMutation(() => ({
		mutationFn: async (shouldFollow: boolean) =>
			await accounts.active!.client.profile.toggleFollow(userId, shouldFollow),

		onMutate: async (shouldFollow: boolean) => {
			const listKey = ['follows', accounts.activeId];
			const profileKey = ['profile', userId];

			await client.cancelQueries({ queryKey: listKey });
			await client.cancelQueries({ queryKey: profileKey });

			const previous = {
				list: client.getQueryData<ListFollowsResponse>(listKey),
				profile: client.getQueryData<ProfileGetResponse>(profileKey)
			};

			client.setQueryData<ListFollowsResponse>(listKey, (old) => {
				if (!old?.ok) {
					return old;
				}

				return {
					...old,
					follows: shouldFollow
						? [...old.follows, { id: userId, mutual: false }]
						: old.follows.filter((entry) => entry.id !== userId)
				};
			});

			client.setQueryData<ProfileGetResponse>(profileKey, (old) => {
				if (!old?.ok || !old.follow) {
					return old;
				}

				return { ...old, follow: { ...old.follow, following: shouldFollow } };
			});

			return { listKey, profileKey, previous };
		},

		onError: (_error, _vars, context) => {
			if (context) {
				client.setQueryData(context.listKey, context.previous.list);
				client.setQueryData(context.profileKey, context.previous.profile);
			}
		},

		onSettled: () => {
			void client.invalidateQueries({ queryKey: ['follows'] });
			void client.invalidateQueries({ queryKey: ['followers'] });
			void client.invalidateQueries({ queryKey: ['profile', userId] });
		}
	}));
</script>

<button
	class="btn btn-sm text-sm follow-button"
	class:btn-primary={!following}
	class:btn-secondary={following}
	disabled={!accounts.isAuthed}
	onclick={() => toggle.mutate(!following)}
>
	{following ? 'Unfollow' : 'Follow'}
</button>

<style>
@media (--mobile) {
	.btn.follow-button {
		font-weight: 500;
		padding: var(--space-padding-xs) var(--space-padding-md);
	}
}
</style>
