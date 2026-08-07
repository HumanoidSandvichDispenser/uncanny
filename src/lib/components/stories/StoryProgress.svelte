<script lang="ts">
	let {
		count,
		current,
		held = false,
		/** How long a story stays on screen before auto-advancing. */
		duration = 6000,
		onadvance
	}: {
		count: number;
		current: number;
		held?: boolean;
		duration?: number;
		onadvance: () => void;
	} = $props();
</script>

<div class="segments" aria-hidden="true">
	{#each Array.from({ length: count }) as _, i}
		<span class="seg">
			{#if i < current}
				<span class="fill done"></span>
			{:else if i === current}
				<span
					class="fill run"
					class:held
					style:animation-duration="{duration}ms"
					onanimationend={onadvance}
				></span>
			{/if}
		</span>
	{/each}
</div>

<style>
	.segments {
		display: flex;
		gap: var(--space-1);
	}

	.seg {
		flex: 1;
		height: 3px;
		border-radius: var(--radius-full);
		background: rgb(255 255 255 / 0.35);
		overflow: hidden;
	}

	.fill {
		display: block;
		height: 100%;
		background: white;
		transform-origin: left;
	}

	.fill.done {
		transform: scaleX(1);
	}

	.fill.run {
		animation: story-progress linear forwards;
	}

	.fill.run.held {
		animation-play-state: paused;
	}

	@keyframes story-progress {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
