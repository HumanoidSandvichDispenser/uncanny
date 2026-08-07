<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';
	import { Tabs } from 'bits-ui';

	let {
		tabs,
		label
	}: {
		tabs: { value: T; label: string }[];

		/**
		 * Custom trigger contents, for tabs that show more than their label
		 * (a count, an icon). Falls back to the plain label.
		 */
		label?: Snippet<[{ value: T; label: string }]>;
	} = $props();

	let listEl = $state<HTMLElement | null>(null);
	let underline = $state({ left: 0, width: 0 });
	let measured = $state(false);

	export function measure() {
		const active = listEl?.querySelector<HTMLElement>('[data-state="active"]');

		if (!active) {
			return;
		}

		underline = { left: active.offsetLeft, width: active.offsetWidth };
		measured = true;
	}

	/*
	 * measure off the DOM rather than off reactive state: bits-ui owns
	 * `data-state`, and triggers resize on their own when a count lands
	 * ("0 Followers" becomes "34 Followers"). watching both means the
	 * underline can't drift out of sync with what's on screen.
	 */
	$effect(() => {
		if (!listEl) {
			return;
		}

		const attributes = new MutationObserver(() => measure());

		attributes.observe(listEl, {
			subtree: true,
			attributes: true,
			attributeFilter: ['data-state']
		});

		const size = new ResizeObserver(() => measure());

		size.observe(listEl);

		for (const trigger of listEl.querySelectorAll('.tab')) {
			size.observe(trigger);
		}

		measure();

		return () => {
			attributes.disconnect();
			size.disconnect();
		};
	});
</script>

<svelte:window onresize={measure} />

<Tabs.List class="tab-bar" bind:ref={listEl}>
	{#each tabs as tab (tab.value)}
		<Tabs.Trigger value={tab.value} class="tab label-md">
			{#if label}
				{@render label(tab)}
			{:else}
				{tab.label}
			{/if}
		</Tabs.Trigger>
	{/each}

	<span
		class="underline"
		class:measured
		style:width="{underline.width}px"
		style:transform="translateX({underline.left}px)"
	></span>
</Tabs.List>

<style>
	:global(.tab-bar) {
		position: relative;
		display: flex;
		gap: var(--space-gap-md);
		border-bottom: var(--border-thin) solid var(--color-border);
	}

	:global(.tab-bar .tab) {
		padding: var(--space-3) var(--space-2);
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	:global(.tab-bar .tab:hover) {
		color: var(--color-text);
	}

	:global(.tab-bar .tab[data-state='active']) {
		color: var(--color-text);
		font-weight: 600;
	}

	.underline {
		position: absolute;
		bottom: calc(-1 * var(--border-thin));
		left: 0;
		height: var(--border-normal);
		background: var(--color-text);
	}

	/* only animate once it has a real position, so it doesn't grow out of the
	   left corner on first paint */
	.underline.measured {
		transition:
			transform var(--duration-standard) var(--ease-out),
			width var(--duration-standard) var(--ease-out);
	}

	@media (prefers-reduced-motion: reduce) {
		.underline.measured {
			transition: none;
		}
	}

	@media (--mobile) {
		:global(.tab-bar) {
			gap: 0;
		}

		:global(.tab-bar .tab) {
			flex: 1;
			text-align: center;
		}
	}
</style>
