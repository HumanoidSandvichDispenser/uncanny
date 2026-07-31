import { createContext } from 'svelte';
import type { Snippet } from 'svelte';

/**
 * Lets a route "teleport" a title and optional markup for controls,
 * subtitles, etc into the global navbar. The navbar shows it only while
 * `visible` is true.
 */
export class PageNav {
	title = $state<string | null>(null);
	content = $state<Snippet | null>(null);
	visible = $state(false);

	reset() {
		this.title = null;
		this.content = null;
		this.visible = false;
	}
}

export const [getPageNav, setPageNav] = createContext<PageNav>();
