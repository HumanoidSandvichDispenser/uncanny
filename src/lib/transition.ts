import { goto } from '$app/navigation';

export type Direction = 'none' | 'back' | 'forward' | 'replace';

let forced: Direction | null = null;

let active: Promise<void> = Promise.resolve();

/**
 * Register the in-flight view transition.
 */
export function setActiveTransition(finished: Promise<void>): void {
	active = finished;
}

/**
 * Resolves once any in-flight view transition has settled. Pages should await
 * this before scrolling/mutating layout, which would otherwise abort the
 * transition mid-animation.
 */
export function transitionSettled(): Promise<void> {
	return active;
}

/**
 * Force the direction of the next navigation.
 */
export function setDirection(direction: Direction): void {
	forced = direction;
}

/**
 * Read and clear the forced direction.
 */
export function takeDirection(): Direction | null {
	const direction = forced;
	forced = null;
	return direction;
}

/**
 * Navigate with an explicit direction.
 */
export function gotoDirection(
	href: Parameters<typeof goto>[0],
	opts: Parameters<typeof goto>[1],
	direction: Direction
): Promise<void> {
	setDirection(direction);
	return goto(href, opts);
}
