<script lang="ts">
	let {
		width,
		height,
		radius,
		text = false,
		lines = 1,
		last = '60%',
		class: className,
		style
	}: {
		/** Any CSS length or percentage. Defaults to filling the container. */
		width?: string;

		/** Any CSS length. Ignored when `text` is set. */
		height?: string;

		/** Overrides the shape's corner radius. */
		radius?: string;

		/** Size to the current font instead of a fixed height. */
		text?: boolean;

		/** Number of text lines to draw. Only meaningful with `text`. */
		lines?: number;

		/** Width of the final line, so a paragraph doesn't end flush. */
		last?: string;

		class?: string;
		style?: string;
	} = $props();

	const vars = $derived(
		[
			width !== undefined && `--skeleton-width: ${width}`,
			height !== undefined && `--skeleton-height: ${height}`,
			radius !== undefined && `--skeleton-radius: ${radius}`,
			style
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

{#if text && lines > 1}
	<span class="lines {className ?? ''}" style={vars} aria-hidden="true">
		{#each { length: lines }, i}
			<span class="skeleton text" style={i === lines - 1 ? `--skeleton-width: ${last}` : ''}
			></span>
		{/each}
	</span>
{:else}
	<span class="skeleton {className ?? ''}" class:text style={vars} aria-hidden="true"></span>
{/if}

<style>
	.skeleton {
		display: block;
		width: var(--skeleton-width, 100%);
		height: var(--skeleton-height, 1rem);
		border-radius: var(--skeleton-radius, var(--radius-md));
		background: var(--color-surface-active, var(--color-surface));
		animation: pulse 1.6s var(--ease-in-out) infinite;
	}

	/* sits on the text baseline box, so it takes the height of whatever font
	   size the caller is already using */
	.skeleton.text {
		--skeleton-radius: var(--radius-sm);
		height: var(--skeleton-height, 0.8em);
		margin: calc((1lh - 0.8em) / 2) 0;
	}

	.lines {
		display: flex;
		flex-direction: column;
		width: var(--skeleton-width, 100%);
	}
</style>
