<script lang="ts">
	import { accounts } from '$lib/accounts.svelte';
	import { relativeTime } from '$lib/format';
	import { displayName } from '$lib/profiles.svelte';
	import { AnswerQueue, pollTotal } from '$lib/answer.svelte';
	import Ucp from '$lib/ucp/components/Ucp.svelte';
	import UcpEditor from '$lib/ucp/editor/UcpEditor.svelte';
	import PaperPlaneRightIcon from 'phosphor-svelte/lib/PaperPlaneRightIcon';
	import SkipForwardIcon from 'phosphor-svelte/lib/SkipForwardIcon';
	import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon';

	const queue = new AnswerQueue();

	$effect(() => {
		accounts.activeId;
		queue.loadNext();
	});

	const question = $derived(queue.question);
	const total = $derived(question ? pollTotal(question) : 0);

	let editor = $state<UcpEditor>();

	// a new question gets a fresh editor (and fresh undo history)
	let lastQuestionId: number | null = null;
	$effect(() => {
		const id = queue.question?.id ?? null;
		if (id === lastQuestionId) {
			return;
		}

		lastQuestionId = id;
		editor?.clear();
	});
</script>

<section class="answer">
	<header class="head">
		<span class="q-lbl label-xs">Answer queue</span>
		{#if question}
			<span class="when text-xs">
				{#if question.author}
					<a class="asker" href="/users/{question.author}">{displayName(question.author)}</a>
				{:else}
					<em>Anonymous</em>
				{/if}
				&middot; {relativeTime(question.time)}
			</span>
		{/if}
	</header>

	{#if queue.loading}
		<p class="state text-sm">Finding a question&hellip;</p>
	{:else if queue.drained}
		<div class="state drained">
			<p class="text-sm">You&rsquo;re all caught up — no questions waiting.</p>
			<button type="button" class="retry label-sm" onclick={() => queue.loadNext()}>
				<ArrowClockwiseIcon size={15} />
				Check again
			</button>
		</div>
	{:else if question}
		<div class="qtext">
			<Ucp text={question.text} context="QA_QUESTION" />
		</div>

		{#if question.poll}
			<ul class="poll">
				{#each question.poll.options as opt, i (i)}
					{@const pct = total > 0 ? Math.round(((opt.votes ?? 0) / total) * 100) : 0}
					<li>
						<button
							type="button"
							class="poll-opt"
							class:answered={question.poll.answered}
							class:yours={opt.yours}
							disabled={question.poll.answered || queue.busy}
							onclick={() => queue.vote(i)}
						>
							{#if question.poll.answered}
								<span class="poll-fill" style:width="{pct}%"></span>
							{/if}
							<span class="poll-text">{opt.text}</span>
							{#if question.poll.answered}
								<span class="poll-pct text-xs">{pct}%</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<UcpEditor
			bind:value={queue.reply}
			bind:this={editor}
			placeholder="Write your answer&hellip;"
			disabled={queue.busy}
			onSubmit={() => queue.submitReply()}
		/>

		{#if queue.error}
			<p class="err text-sm">{queue.error}</p>
		{/if}

		<div class="actions">
			<button
				type="button"
				class="ghost label-sm"
				onclick={() => queue.snooze()}
				disabled={queue.busy}
			>
				<SkipForwardIcon size={15} />
				Skip
			</button>
			<button
				type="button"
				class="post label-sm"
				onclick={() => queue.submitReply()}
				disabled={queue.busy || queue.reply.trim().length === 0}
			>
				<PaperPlaneRightIcon size={15} weight="fill" />
				Post answer
			</button>
		</div>
	{:else if queue.error}
		<div class="state">
			<p class="err text-sm">{queue.error}</p>
			<button type="button" class="retry label-sm" onclick={() => queue.loadNext()}>
				<ArrowClockwiseIcon size={15} />
				Try again
			</button>
		</div>
	{/if}
</section>

<style>
	.answer {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--color-bg-card);
		border: var(--border-normal) solid var(--color-primary);
		border-radius: var(--radius-lg);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.q-lbl {
		align-self: flex-start;
		padding: var(--space-1) var(--space-2);
		background: var(--color-primary);
		color: var(--color-text-inverse);
		border-radius: var(--radius-sm);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.when {
		color: var(--color-text-tertiary);
	}

	.when em {
		font-style: italic;
	}

	.asker {
		color: var(--color-text-secondary);
		font-weight: 600;
	}

	.qtext {
		font-family: var(--font-serif);
		font-size: var(--text-lg);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.ghost,
	.post,
	.retry {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.ghost {
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-secondary);
		background: none;
		border: none;
	}

	.ghost:hover:not(:disabled) {
		color: var(--color-text);
	}

	.post {
		margin-left: auto;
		padding: var(--space-2) var(--space-4);
		color: var(--color-text-inverse);
		background: var(--color-accent-600);
		border: none;
	}

	.post:hover:not(:disabled) {
		background: var(--color-accent-700);
	}

	.post:disabled,
	.ghost:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.state {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-2);
		color: var(--color-text-secondary);
	}

	.retry {
		padding: var(--space-1) 0;
		color: var(--color-primary);
		background: none;
		border: none;
	}

	.err {
		color: var(--color-error);
	}

	/* Poll */
	.poll {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		list-style: none;
	}

	.poll-opt {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		text-align: left;
		color: var(--color-text);
		background: var(--color-surface);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
	}

	.poll-opt:hover:not(:disabled):not(.answered) {
		border-color: var(--color-primary);
	}

	.poll-opt.answered {
		cursor: default;
	}

	.poll-opt.yours {
		border-color: var(--color-primary);
	}

	.poll-fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--color-primary-light);
	}

	.poll-text,
	.poll-pct {
		position: relative;
	}

	.poll-pct {
		margin-left: auto;
		color: var(--color-text-secondary);
		font-variant-numeric: tabular-nums;
	}
</style>
