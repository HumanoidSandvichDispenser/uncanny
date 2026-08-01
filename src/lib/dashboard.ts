import { batched } from '$lib/batch';
import { accounts } from '$lib/accounts.svelte';

/**
 * TanStack Query options for the home dashboard summary (recent questions,
 * recent posts, and Pulse)
 */
export function dashboardQueryOptions() {
	return {
		queryKey: ['dashboard', accounts.activeId],
		queryFn: async () => {
			const client = accounts.active!.client;
			return await batched(client, client.dashboard.get());
		},
		enabled: accounts.isAuthed
	};
}
