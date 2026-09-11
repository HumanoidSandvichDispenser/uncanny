import type { MessageViewResponse } from '@sandvichxyz/pecans';
import { accounts } from './accounts.svelte';
import { batched } from './batch';

/**
 * Query options for a page of the active account's inbox.
 */
export function inboxQuery(inbox: string, page = 1) {
	return {
		queryKey: ['messages', 'inbox', accounts.activeId, page],
		queryFn: () => batched(accounts.active!.client.messages.folderView(inbox, page)),
		enabled: accounts.isAuthed
	};
}

/**
 * Infinite query options for a conversation thread. Page 1 holds the newest
 * messages; later pages are progressively older.
 */
export function threadQuery(id: string) {
	return {
		queryKey: ['messages', 'thread', id, accounts.activeId],
		enabled: accounts.isAuthed,
		initialPageParam: 1,

		queryFn: ({ pageParam }: { pageParam: number }) =>
			batched(accounts.active!.client.messages.view(id, true, true, pageParam)),

		getNextPageParam: (lastPage: MessageViewResponse, pages: MessageViewResponse[]) =>
			lastPage.hasMore ? pages.length + 1 : undefined
	};
}
