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

<div class="page">
	<div class="stories">
		<StoryStrip />
	</div>

	<main class="home">
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
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--space-gap-md);
		padding: var(--space-padding-xl);

		@media (--mobile) {
			gap: var(--space-gap-sm);
			padding: var(--space-padding-sm);
		}
	}

	.home {
		width: 100%;
		max-width: calc(var(--width-content) + var(--width-narrow) + var(--space-5));
		margin: 0 auto;
		display: grid;
		gap: var(--space-5);
		align-items: start;

		grid-template-columns: minmax(0, 1fr);
	}

	.stories {
		width: 100%;
		max-width: calc(var(--width-content) + var(--width-narrow) + var(--space-5));
		margin: 0 auto;
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
