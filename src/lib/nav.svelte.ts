import { createContext } from 'svelte';
import type { Snippet } from 'svelte';

/**
 * A simple store for the page navigation state.
 */
export class PageNav {
	title = $state<string | null>(null);
	controls = $state<Snippet | null>(null);
	/** Whether to show the title/controls in the desktop navbar. */
	showTitle = $state(false);
	/**
	 * Whether the layout renders the shared chrome (Navbar/MobileNav).
	 * Setting this to 'none' will hide the chrome and allow the page to take up
	 * the full viewport.
	 */
	chrome = $state<'default' | 'none'>('default');

	reset() {
		this.title = null;
		this.controls = null;
		this.showTitle = false;
		this.chrome = 'default';
	}
}

export const [getPageNav, setPageNav] = createContext<PageNav>();

class NavHistory {
	depth = $state(0);

	get canGoBack(): boolean {
		return this.depth > 0;
	}
}

export const navHistory = new NavHistory();

export const navLinks: { href: string; label: string }[] = [
	{ href: '/', label: 'Home' },
	{ href: '/messages', label: 'Messages' },
	{ href: '/forum', label: 'Forum' }
];

export function isActive(href: string, pathname: string): boolean {
	return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
