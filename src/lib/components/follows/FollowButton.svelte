<script lang="ts">
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import type { ListFollowsResponse } from '@sandvichxyz/pecans';
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
			const key = ['follows', accounts.activeId];

			await client.cancelQueries({ queryKey: key });

			const previous = client.getQueryData<ListFollowsResponse>(key);

			client.setQueryData<ListFollowsResponse>(key, (old) => {
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

			return { key, previous };
		},

		onError: (_error, _vars, context) => {
			if (context) {
				client.setQueryData(context.key, context.previous);
			}
		},

		onSettled: () => {
			void client.invalidateQueries({ queryKey: ['follows'] });
			void client.invalidateQueries({ queryKey: ['followers'] });
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
