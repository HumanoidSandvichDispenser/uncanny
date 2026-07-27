import { avatarColor } from './format';

/**
 * Anonymous identity presentation.
 */

export const ANON_PREFIX = 'anon:';
const YOU_PREFIX = 'anon:you:';

/**
 * Create an anonymous identity string from a seed.
 */
export function anonId(seed: string | number): string {
	return `${ANON_PREFIX}${seed}`;
}

/**
 * Create an anonymous identity string for your own identity from a seed.
 */
export function youAnonId(id: string): string {
	return `${YOU_PREFIX}${id}`;
}

/**
 * Your own identity id if this is a `youAnonId`, else null.
 */
export function youAnonRealId(name: string): string | null {
	return name.startsWith(YOU_PREFIX) ? name.slice(YOU_PREFIX.length) : null;
}

/**
 * Parse an identity string, returning the seed if it's an anonymous *other*,
 * else null. `youAnonId` values are excluded — check {@link youAnonRealId}.
 */
export function anonSeed(name: string): string | null {
	if (name.startsWith(YOU_PREFIX)) {
		return null;
	}
	return name.startsWith(ANON_PREFIX) ? name.slice(ANON_PREFIX.length) : null;
}

/**
 * Stable color for an anonymous identity, based on the seed.
 */
export function anonColor(seed: string): string {
	return avatarColor(`anon:${seed}`);
}

function hash(str: string): number {
	let h = 0;

	for (let i = 0; i < str.length; i++) {
		h = (h * 31 + str.charCodeAt(i)) | 0;
	}

	return Math.abs(h);
}

export type IdenticonCell = { x: number; y: number };

/**
 * Generate a list of filled cells for a 5x5 identicon based on a seed string.
 */
export function identiconCells(seed: string): IdenticonCell[] {
	const cells: IdenticonCell[] = [];

	let state = hash(seed) || 1;
	const nextBit = () => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return (state >> 16) & 1;
	};

	for (let y = 0; y < 5; y++) {
		for (let x = 0; x < 3; x++) {
			if (!nextBit()) {
				continue;
			}
			for (const cx of x === 2 ? [2] : [x, 4 - x]) {
				cells.push({ x: cx * 8 + 4, y: y * 8 + 4 });
			}
		}
	}

	return cells;
}
