<script lang="ts">
	import StoryStrip from '$lib/components/home/StoryStrip.svelte';
	import AskPill from '$lib/components/home/AskPill.svelte';
	import AnswerWidget from '$lib/components/home/AnswerWidget.svelte';
	import RecentQuestions from '$lib/components/home/RecentQuestions.svelte';
	import RecentForumPosts from '$lib/components/home/RecentForumPosts.svelte';
	import FeedPreview from '$lib/components/home/FeedPreview.svelte';
	import Pulse from '$lib/components/home/Pulse.svelte';
	import PageNav from '$lib/components/PageNav.svelte';
</script>

<PageNav title="Home" />

<main class="home">
	<div class="span"><StoryStrip /></div>

	<div class="col center">
		<AskPill />
		<AnswerWidget />
		<RecentQuestions />
	</div>

	<div class="col rail">
		<RecentForumPosts />
		<FeedPreview />
		<Pulse />
	</div>
</main>

<style>
	.home {
		width: 100%;
		max-width: calc(var(--width-content) + var(--width-narrow) + var(--space-5));
		margin: 0 auto;
		padding: var(--space-6);
		display: grid;
		gap: var(--space-5);
		align-items: start;

		grid-template-columns: minmax(0, 1fr);
	}

	.span {
		grid-column: 1 / -1;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		min-width: 0;
	}

	@media (min-width: 60rem) {
		.home {
			grid-template-columns: minmax(0, var(--width-content)) var(--width-narrow);
			justify-content: center;
		}
	}
</style>
