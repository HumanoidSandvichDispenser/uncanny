<script lang="ts">
	import GhostIcon from 'phosphor-svelte/lib/GhostIcon';
</script>

<span class="anon-marker" title="Posted anonymously" aria-label="Posted anonymously">
	<GhostIcon size={14} weight="fill" />
</span>

<style>
	.anon-marker {
		display: inline-flex;
		color: var(--color-text-tertiary);
	}
</style>
