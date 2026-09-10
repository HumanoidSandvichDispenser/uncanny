import type { Message, MessageThreadMember } from '@sandvichxyz/pecans';
import { anonId, youAnonId } from './anon';
import { accounts } from './accounts.svelte';

/**
 * Consecutive messages from the same member within this window (in seconds)
 * are grouped together, Slack-style.
 */
export const MESSAGE_GROUP_WINDOW = 10 * 60;

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

function sameDay(a: number, b: number): boolean {
	const da = new Date(a * 1000);
	const db = new Date(b * 1000);

	return (
		da.getFullYear() === db.getFullYear() &&
		da.getMonth() === db.getMonth() &&
		da.getDate() === db.getDate()
	);
}

/**
 * Group messages in chronological order. A message starts a new group when it
 * is the first message, changes member or type, is more than
 * {@link MESSAGE_GROUP_WINDOW} after the previous message, or crosses into a
 * new calendar day.
 */
export function groupMessages(messages: Message[]): Message[][] {
	const groups: Message[][] = [];

	for (const message of messages) {
		const group = groups.at(-1);
		const previous = group?.at(-1);

		const continues =
			previous !== undefined &&
			previous.member === message.member &&
			previous.type === message.type &&
			message.time - previous.time <= MESSAGE_GROUP_WINDOW &&
			sameDay(previous.time, message.time);

		if (continues) {
			group!.push(message);
		} else {
			groups.push([message]);
		}
	}

	return groups;
}
