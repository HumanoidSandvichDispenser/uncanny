import { describe, it, expect } from 'vitest';
import type { Message, MessageThreadMember } from '@sandvichxyz/pecans';
import { MESSAGE_GROUP_WINDOW, groupMessages, messageSender } from './messageGroups';

const BASE = Date.UTC(2026, 0, 15, 12, 0, 0) / 1000;

function message(overrides: Partial<Message> = {}): Message {
	return { id: 1, member: 1, time: BASE, type: 'message', html: '<p>hi</p>', ...overrides };
}

describe('groupMessages', () => {
	it('groups a lone message into its own group', () => {
		expect(groupMessages([message()])).toHaveLength(1);
	});

	it('groups consecutive messages from the same member within the window', () => {
		const groups = groupMessages([
			message({ id: 1 }),
			message({ id: 2, time: BASE + 60 }),
			message({ id: 3, time: BASE + 120 })
		]);

		expect(groups).toHaveLength(1);
		expect(groups[0].map((m) => m.id)).toEqual([1, 2, 3]);
	});

	it('chains groups as long as each message is within the window of the previous', () => {
		const groups = groupMessages([
			message({ id: 1 }),
			message({ id: 2, time: BASE + MESSAGE_GROUP_WINDOW }),
			message({ id: 3, time: BASE + MESSAGE_GROUP_WINDOW * 2 })
		]);

		expect(groups).toHaveLength(1);
	});

	it('starts a new group after a gap larger than the window', () => {
		const groups = groupMessages([
			message({ id: 1 }),
			message({ id: 2, time: BASE + MESSAGE_GROUP_WINDOW + 1 })
		]);

		expect(groups).toHaveLength(2);
	});

	it('starts a new group when the member changes', () => {
		const groups = groupMessages([message({ id: 1 }), message({ id: 2, member: 2 })]);

		expect(groups).toHaveLength(2);
	});

	it('starts a new group when the type changes', () => {
		const groups = groupMessages([message({ id: 1 }), message({ id: 2, type: 'system' })]);

		expect(groups).toHaveLength(2);
	});

	it('starts a new group across a day boundary', () => {
		const groups = groupMessages([message({ id: 1 }), message({ id: 2, time: BASE + 86400 })]);

		expect(groups).toHaveLength(2);
	});

	it('keeps empty input empty', () => {
		expect(groupMessages([])).toEqual([]);
	});
});

describe('messageSender', () => {
	function member(overrides: Partial<MessageThreadMember> = {}): MessageThreadMember {
		return { mid: 7, readTo: 0, ...overrides };
	}

	it('uses the user id for a normal member', () => {
		expect(messageSender(member({ id: 'u1' }), 7)).toEqual({
			anon: false,
			userId: 'u1',
			avatar: 'u1'
		});
	});

	it('seeds an anonymous member identicon on the member id', () => {
		expect(messageSender(member({ anon: true, id: 'u1' }), 7)).toEqual({
			anon: true,
			userId: null,
			avatar: 'anon:7'
		});
	});

	it('uses the real identity for your own anonymous messages', () => {
		expect(messageSender(member({ anon: true, you: true, id: 'u1' }), 7)).toEqual({
			anon: true,
			userId: null,
			avatar: 'anon:you:u1'
		});
	});

	it('falls back to a seeded anonymous identity when the member is missing', () => {
		expect(messageSender(undefined, 7)).toEqual({
			anon: true,
			userId: null,
			avatar: 'anon:7'
		});
	});

	it('falls back to a seeded anonymous identity when the user id is unknown', () => {
		expect(messageSender(member(), 7)).toEqual({
			anon: true,
			userId: null,
			avatar: 'anon:7'
		});
	});
});
