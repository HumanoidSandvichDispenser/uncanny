<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';
</script>

<div class="row">
	<div class="main-col">
		<div class="user">
			<div class="left">
				<Skeleton circle size="24px" />
				<span class="text-xs"><Skeleton text width="5rem" /></span>
				<span class="text-xs"><Skeleton text width="8rem" /></span>
			</div>
			<div class="right">
				<span class="text-xs"><Skeleton text width="3.5rem" /></span>
			</div>
		</div>
		<Skeleton text lines={2} />
	</div>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-padding-sm);
	}

	.main-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-width: 0;
		flex: 1;
	}

	.user {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		justify-content: space-between;
	}

	.user .left {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.right {
		flex: none;
	}
</style>
