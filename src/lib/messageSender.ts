import type { MessageThreadMember } from '@sandvichxyz/pecans';
import { anonId, youAnonId } from './anon';
import { accounts } from './accounts.svelte';

export type MessageSender =
	{ anon: false; userId: string; avatar: string } | { anon: true; userId: string | null; avatar: string };

/**
 * Resolve how a thread member should be presented, respecting anonymous
 * identities. Anonymous avatars are seeded on the thread member id.
 */
export function messageSender(member: MessageThreadMember | undefined, mid: number): MessageSender {
	if (!member?.anon && member?.id !== undefined) {
		return { anon: false, userId: member.id, avatar: member.id };
	}

	if (member?.you && accounts.activeId) {
		const yourId = accounts.activeId;
		return { anon: true, userId: yourId, avatar: youAnonId(yourId) };
	}

	return { anon: true, userId: null, avatar: anonId(member?.mid ?? mid) };
}
