import { accounts } from './accounts.svelte';
import { batched } from './batch';

/**
 * Query options for the users the active account follows.
 */
export function followsQuery() {
	return {
		queryKey: ['follows', accounts.activeId],
		queryFn: () => batched(accounts.active!.client.profile.listFollows()),
		enabled: accounts.isAuthed
	};
}

/**
 * Query options for the users who follow the active account.
 */
export function followersQuery() {
	return {
		queryKey: ['followers', accounts.activeId],
		queryFn: () => batched(accounts.active!.client.profile.listFollowers()),
		enabled: accounts.isAuthed
	};
}
