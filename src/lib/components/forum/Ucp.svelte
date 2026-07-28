<script lang="ts">
	import { parseUcpHtml, type UcpContext } from '$lib/ucp/parser';
	import { displayName } from '$lib/profiles.svelte';

	let { text, context = 'FORUM' }: { text: string; context?: UcpContext } = $props();

	const html = $derived(parseUcpHtml(text, context));

	let container = $state<HTMLDivElement>();

	// Reimplements the interactive bits the legacy TC client wired up:
	// click-to-reveal spoilers and username tiles inside quotes.
	$effect(() => {
		// re-run whenever the rendered markup changes
		html;
		const root = container;
		if (!root) {
			return;
		}

		for (const el of root.querySelectorAll('.ucp-spoiler-uninitialized')) {
			revealOnClick(el, 'ucp-spoiler-unspoiled', 'ucp-spoiler-spoiled', el);
			el.classList.remove('ucp-spoiler-uninitialized');
		}

		for (const el of root.querySelectorAll('.ucp-mspoiler-uninitialized')) {
			const host = el.parentElement ?? el;
			revealOnClick(el, 'ucp-mspoiler-unspoiled', 'ucp-mspoiler-spoiled', host);
			el.classList.remove('ucp-mspoiler-uninitialized');
		}

		for (const el of root.querySelectorAll('.ucp-quote-user-tile')) {
			const id = (el.textContent ?? '').trim();
			el.classList.remove('ucp-quote-user-tile');
			el.classList.add('ucp-quote-user-tile-handled');
			el.textContent = `${displayName(id)} said…`;
		}
	});

	function revealOnClick(el: Element, unspoiled: string, spoiled: string, clickTarget: Element) {
		el.classList.add(unspoiled);
		let done = false;
		clickTarget.addEventListener('click', () => {
			if (done) {
				return;
			}
			done = true;
			el.classList.add(spoiled);
			el.classList.remove(unspoiled);
		});
	}
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div bind:this={container} class="ucp">{@html html}</div>
