<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { dashboardQueryOptions } from '$lib/dashboard';

	const dash = createQuery(() => dashboardQueryOptions());
	const nums = $derived(dash.data?.pointlessNums);

	const fmt = new Intl.NumberFormat();

	function count(value: number | undefined): string {
		return value === undefined ? '-' : fmt.format(value);
	}
</script>

<section class="panel">
	<header class="p-head">
		<h3 class="label-xs p-title">Pulse</h3>
	</header>
	<p class="stat text-sm">
		<b>{count(nums?.usersRegistered)}</b> members
		<span class="mid">&middot;</span>
		<b>{count(nums?.questionsAndAnswers)}</b> Q&amp;As
	</p>
</section>

<style>
	.panel {
		padding: var(--space-4);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.p-head {
		margin-bottom: var(--space-2);
	}

	.p-title {
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.09em;
	}

	.stat {
		color: var(--color-text-secondary);
	}

	.stat b {
		color: var(--color-text);
		font-variant-numeric: tabular-nums;
	}

	.mid {
		margin: 0 var(--space-1);
		color: var(--color-text-tertiary);
	}
</style>
