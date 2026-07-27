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
