<script lang="ts">
	import type { StoryBackground } from '@sandvichxyz/pecans';
	import { imageUrl } from '$lib/imageCache.svelte';

	// HACK: pecans currently has wrong type for StoryBackground
	type RawBackground = StoryBackground & {
		isSolid?: boolean;
		color?: [number, number, number];
		isGradient?: boolean;
		fromColor?: [number, number, number];
		toColor?: [number, number, number];
	};

	let { background }: { background: RawBackground | null } = $props();

	const bgUrl = $derived(
		background?.isImage && background.imageId ? imageUrl(background.imageId) : null
	);

	/** CSS background for solid/gradient stories; null when the background is an image. */
	const bgStyle = $derived.by(() => {
		if (!background) {
			return null;
		}

		if (background.isSolid && background.color) {
			return tupleRgb(background.color);
		}

		if (background.isGradient && background.fromColor && background.toColor) {
			const from = background.fromColor;
			const to = background.toColor;

			return `linear-gradient(160deg, ${tupleRgb(from)}, ${tupleRgb(to)})`;
		}

		return null;
	});

	/** Background colors arrive as raw `[r, g, b]` tuples, unlike normalized text colors. */
	function tupleRgb(color: [number, number, number]): string {
		return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
	}
</script>

<div class="bg" style:background={bgStyle ?? undefined}>
	{#if bgUrl}
		<img class="cover" src={bgUrl} alt="" />
		<img class="contain" src={bgUrl} alt="" />
	{/if}
</div>

<style>
	.bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.bg img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.cover {
		object-fit: cover;
		transform: scale(1.1);
		filter: blur(20px) brightness(0.8);
	}

	.contain {
		object-fit: contain;
		image-rendering: pixelated;
		filter: drop-shadow(0 16px 32px rgb(0 0 0 / 0.45));
	}
</style>
