<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';
</script>

<div class="row">
	<div class="main-col">
		<div class="headline">
			<h2 class="h3 title"><Skeleton text width="55%" /></h2>
			<span class="replies text-xs"><Skeleton text width="2.5rem" /></span>
		</div>
		<div class="user">
			<Skeleton circle size="32px" />
			<span class="text-xs"><Skeleton text width="6rem" /></span>
			<span class="text-xs"><Skeleton text width="4rem" /></span>
		</div>
		<Skeleton text lines={2} />
		<div class="last-post">
			<span class="filler"><Skeleton text width="45%" /></span>
			<Skeleton circle size="24px" />
		</div>
	</div>
</div>

<style>
	/* chrome mirrors ThreadCard's .row, so the two branches swap without a jump */
	.row {
		display: flex;
		align-items: center;
		padding: var(--space-padding-lg);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-lg);

		@media (--mobile) {
			padding: var(--space-padding-sm);
		}
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-gap-sm);
		min-width: 0;
		flex: 1;

		@media (--mobile) {
			gap: var(--space-gap-xs);
		}
	}

	.headline {
		display: flex;
		align-items: center;
		gap: var(--space-gap-sm);
	}

	.title {
		min-width: 0;
		flex: 1;

		@media (--mobile) {
			font-size: var(--text-xl);
		}
	}

	.replies {
		flex: none;
	}

	.user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.last-post {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.filler {
		flex: 1;
		display: flex;
		justify-content: flex-end;
	}
</style>
