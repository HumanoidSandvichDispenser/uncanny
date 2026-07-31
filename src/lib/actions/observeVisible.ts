import type { Action } from 'svelte/action';

/**
 * Calls `onChange(true/false)` as the node enters or leaves the viewport.
 */
export const observeVisible: Action<HTMLElement, (visible: boolean) => void> = (node, onChange) => {
	let notify = onChange;

	const io = new IntersectionObserver(([entry]) => {
		notify(entry.isIntersecting);
	});

	io.observe(node);

	return {
		update(next) {
			notify = next;
		},
		destroy() {
			io.disconnect();
		}
	};
};
