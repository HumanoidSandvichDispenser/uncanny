<script lang="ts">
	import Skeleton from '$lib/components/Skeleton.svelte';
</script>

<div class="row">
	<div class="main-col">
		<span class="label-md"><Skeleton text width="8rem" /></span>
		<span class="text-sm"><Skeleton text width="70%" /></span>
	</div>
	<div class="meta text-xs">
		<Skeleton text width="5rem" />
		<Skeleton text width="4.5rem" />
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
		gap: var(--space-1);
		min-width: 0;
		flex: 1;
	}

	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-1);
		flex: none;
	}
</style>
