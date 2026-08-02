import { goto } from '$app/navigation';

export type Direction = 'none' | 'back' | 'forward';

let forced: Direction | null = null;

/** Force the direction of the next navigation. */
export function setDirection(direction: Direction): void {
	forced = direction;
}

/** Read and clear the forced direction. */
export function takeDirection(): Direction | null {
	const direction = forced;
	forced = null;
	return direction;
}

/** Navigate with the specified direction. */
export function gotoDirection(
	href: Parameters<typeof goto>[0],
	opts: Parameters<typeof goto>[1],
	direction: Direction
): Promise<void> {
	setDirection(direction);
	return goto(href, opts);
}
