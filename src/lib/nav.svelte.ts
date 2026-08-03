import { createContext } from 'svelte';
import type { Snippet } from 'svelte';

/**
 * A simple store for the page navigation state.
 */
export class PageNav {
	title = $state<string | null>(null);
	controls = $state<Snippet | null>(null);
	showTitle = $state(false);

	reset() {
		this.title = null;
		this.controls = null;
		this.showTitle = false;
	}
}

export const [getPageNav, setPageNav] = createContext<PageNav>();
