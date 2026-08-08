import type { TCProfile } from '@sandvichxyz/pecans';

/**
 * Profile cache, keyed by user ID.
 */
export const profileCache = $state<Record<string, TCProfile>>({});

export function getProfile(id: string): TCProfile | undefined {
	return profileCache[id];
}

export function displayName(id: string): string {
	return profileCache[id]?.name || id;
}

export type Identity = {
	/** The user's chosen display name. */
	name: string;
	id: string;
	isAdmin: boolean;
};

/**
 * Everything needed to render a user's name, so each call site can lay it out
 * however it likes without duplicating the lookups.
 */
export function identity(id: string): Identity {
	const name = displayName(id);
	const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');

	return {
		name,
		id,
		isAdmin: profileCache[id]?.admin ?? false,
	};
}

export type ProfileStatus =
	| 'online'
	| 'recent'
	| 'offline';

const STATUS_THRESHOLD = {
	online: 5 * 60 * 1000, // 5 minutes
	recent: 60 * 60 * 1000, // 1 hour
};

export function profileStatus(id: string): ProfileStatus {
	const profile = profileCache[id];
	
	if (!profile) {
		return 'offline';
	}

	const timeSinceLastOnline = Date.now() - profile.online * 1000;

	console.log(`Profile ${id} last online ${timeSinceLastOnline}ms ago`);

	if (timeSinceLastOnline < STATUS_THRESHOLD.online) {
		return 'online';
	}

	if (timeSinceLastOnline < STATUS_THRESHOLD.recent) {
		return 'recent';
	}

	return 'offline';
}
