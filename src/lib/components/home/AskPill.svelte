<script lang="ts">
	// Composer entry point. Clicking opens the ask-a-question modal.
	// TODO: wire up the modal — for now this is a non-functional placeholder.
	function open() {
		// no-op until the ask modal exists
	}
</script>

<button type="button" class="ask" aria-haspopup="dialog" onclick={open}>
	<span class="ph text-md">Ask a question&hellip;</span>
	<span class="go label-sm">Ask</span>
</button>

<style>
	.ask {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-xs);
		cursor: text;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.ask:hover {
		border-color: var(--color-neutral-300);
	}

	.ph {
		flex: 1;
		text-align: left;
		color: var(--color-text-tertiary);
	}

	.go {
		padding: var(--space-2) var(--space-4);
		background: var(--color-neutral-700);
		color: var(--color-text-inverse);
		border-radius: var(--radius-full);
	}
</style>
