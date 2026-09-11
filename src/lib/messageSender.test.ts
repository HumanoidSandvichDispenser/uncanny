import { describe, it, expect, vi } from 'vitest';
import type { MessageThreadMember } from '@sandvichxyz/pecans';
import { messageSender } from './messageSender';

// the real accounts singleton reads localStorage at module load, which the node
// test environment lacks
vi.mock('./accounts.svelte', () => ({ accounts: { activeId: 'u1' } }));

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
			userId: 'u1',
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
