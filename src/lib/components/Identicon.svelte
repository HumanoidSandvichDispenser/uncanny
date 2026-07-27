<script lang="ts">
	import { anonColor, identiconCells } from '$lib/anon';

	let { seed }: { seed: string } = $props();

	const color = $derived(anonColor(seed));
	const cells = $derived(identiconCells(seed));

	const bg = $derived(`color-mix(in srgb, ${color} 14%, transparent)`);
</script>

<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
	<rect width="48" height="48" fill={bg} />
	<g fill={color}>
		{#each cells as cell (`${cell.x}:${cell.y}`)}
			<rect x={cell.x} y={cell.y} width="8" height="8" rx="1.5" />
		{/each}
	</g>
</svg>

<style>
	svg {
		display: block;
		border-radius: var(--radius-full);
	}
</style>
