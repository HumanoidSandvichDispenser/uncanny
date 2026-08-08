<script lang="ts">
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import type { Story } from '@sandvichxyz/pecans';
	import { accounts } from '$lib/accounts.svelte';
	import { batched } from '$lib/batch';
	import { displayName } from '$lib/profiles.svelte';
	import { navHistory } from '$lib/nav.svelte';
	import { gotoDirection } from '$lib/transition';
	import { overrideThemeColor } from '$lib/themeColor';
	import PageNav from '$lib/components/PageNav.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import StoryBackground from '$lib/components/stories/StoryBackground.svelte';
	import StoryProgress from '$lib/components/stories/StoryProgress.svelte';

	const activeId = $derived(accounts.activeId);

	const storiesQuery = createQuery(() => ({
		queryKey: ['stories', activeId],
		queryFn: () => batched(accounts.active!.client.stories.viewList()),
		enabled: accounts.isAuthed,
		staleTime: 30_000
	}));

	const list = $derived(storiesQuery.data?.stories ?? []);

	/**
	 * Group stories by userId, so we can show them in order and know how many
	 * each user has.
	 */
	const groups = $derived.by(() => {
		const byUser = new Map<string, Story[]>();
		for (const s of list) {
			const arr = byUser.get(s.userId);
			if (arr) arr.push(s);
			else byUser.set(s.userId, [s]);
		}
		return [...byUser].map(([userId, stories]) => ({ userId, stories }));
	});

	const items = $derived.by(() =>
		groups.flatMap((g) => g.stories.map((story, n) => ({ userId: g.userId, n })))
	);

	const userGroup = $derived(
		groups.find((g) => g.userId === page.params.id) ?? null
	);
	const userStories = $derived(userGroup?.stories ?? []);

	// which story of this user to show, from ?n= (clamped). Defaults to 0.
	const n = $derived.by(() => {
		const raw = Number(page.url.searchParams.get('n') ?? 0);
		if (!Number.isInteger(raw) || raw < 0) return 0;
		return Math.min(raw, Math.max(0, userStories.length - 1));
	});

	const currentPos = $derived(
		items.findIndex((it) => it.userId === page.params.id && it.n === n)
	);

	const story = $derived(n < userStories.length ? userStories[n] : null);

	const name = $derived(story ? displayName(story.userId) : '');

	const LINE_POSITIONS = ['top', 'middle', 'bottom'] as const;

	let held = $state(false);

	$effect(() => overrideThemeColor('#09090b'));

	function rgb(color: { r: number; g: number; b: number }): string {
		return `rgb(${color.r}, ${color.g}, ${color.b})`;
	}

	function go(delta: number) {
		const target = items[currentPos + delta];

		if (!target) {
			close();
			return;
		}

		const href = target.n === 0
				? `/stories/${target.userId}`
				: `/stories/${target.userId}?n=${target.n}`;

		gotoDirection(href, { replaceState: true, noScroll: true }, 'replace');
	}

	function close() {
		if (navHistory.canGoBack) {
			history.back();
		} else {
			gotoDirection('/', {}, 'back');
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' && currentPos > 0) {
			go(-1);
		} else if (event.key === 'ArrowRight') {
			go(1);
		} else if (event.key === 'Escape') {
			close();
		}
	}
</script>

<PageNav chrome="none" />

<svelte:window
	onkeydown={onKeydown}
	onpointerdown={() => (held = true)}
	onpointerup={() => (held = false)}
	onpointercancel={() => (held = false)}
/>

<div class="viewer" aria-label="Story viewer">
	{#if storiesQuery.isPending}
		<!-- dark backdrop -->
	{:else if !story}
		<div class="missing">
			<p class="text-sm">This story not available.</p>
			<button class="btn btn-secondary label-sm" onclick={close}>Go back</button>
		</div>
	{:else}
		<div class="stage">
			<div class="card">
				<StoryBackground background={story.background} />

				{#each LINE_POSITIONS as pos (pos)}
					{#if story.text?.[pos]?.value}
						<span class="line {pos}" style:color={rgb(story.text[pos].color)}>
							{story.text[pos].value}
						</span>
					{/if}
				{/each}

				<!-- tap zones -->
				<div class="zones">
					<button
						class="zone"
						onclick={() => go(-1)}
						disabled={currentPos <= 0}
						aria-label="Previous story"
					></button>
					<button class="zone" onclick={() => go(1)} aria-label="Next story"></button>
				</div>

				<header class="chrome-top">
					<StoryProgress
						count={items.length}
						current={currentPos}
						held={held}
						onadvance={() => go(1)}
					/>

					<div class="bar">
						<a class="who" href="/users/{story.userId}">
							<UserAvatar name={story.userId} size={30} />
							<span class="label-sm">{name}</span>
						</a>
						<button class="btn btn-icon close" onclick={close} aria-label="Close story">
							<XIcon size={20} weight="bold" />
						</button>
					</div>
				</header>
			</div>

			{#if currentPos > 0}
				<button class="flank prev" onclick={() => go(-1)} aria-label="Previous story">
					<CaretLeftIcon size={26} weight="bold" />
				</button>
			{/if}
			<button class="flank next" onclick={() => go(1)} aria-label="Next story">
				<CaretRightIcon size={26} weight="bold" />
			</button>
		</div>
	{/if}
</div>

<style>
	.viewer {
		position: fixed;
		inset: 0;
		z-index: var(--z-fixed);
		display: flex;
		background: #09090b;
		color: #fff;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.stage {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: linear-gradient(160deg, #2a2a33, #131316);
	}

	@media (width >= 640px) {
		.card {
			width: auto;
			height: min(calc(100% - var(--space-6)), 52rem);
			aspect-ratio: 9 / 16;
			max-width: calc(100vw - 2 * var(--space-6));
			border-radius: var(--radius-xl);
		}
	}

	.line {
		position: absolute;
		left: var(--space-4);
		right: var(--space-4);
		font: 600 22px var(--font-ui);
		line-height: 1.3;
		text-align: center;
		overflow-wrap: anywhere;
		text-shadow:
			0 1px 12px rgb(0 0 0 / 0.55),
			0 0 2px rgb(0 0 0 / 0.4);
		pointer-events: none;
	}

	.line.top {
		top: 15%;
	}

	.line.middle {
		top: 50%;
		translate: 0 -50%;
	}

	.line.bottom {
		bottom: 15%;
	}

	.zones {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		touch-action: manipulation;
	}

	.zone {
		flex: 1 1 70%;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	.zone:first-child {
		flex: 1 1 30%;
	}

	.zone:disabled {
		cursor: default;
	}

	.chrome-top {
		position: absolute;
		inset: 0 0 auto 0;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-3) var(--space-6);
		/* viewport-fit=cover puts the card under the notch/status bar. */
		padding-top: max(var(--space-3), env(safe-area-inset-top));
		background: linear-gradient(rgb(0 0 0 / 0.45), transparent);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: #fff;
	}

	.who:hover {
		text-decoration: none;
	}

	.who span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close {
		color: #fff;
	}

	.close:hover:not(:disabled) {
		background: rgb(255 255 255 / 0.15);
	}

	.flank {
		position: absolute;
		top: 50%;
		translate: 0 -50%;
		z-index: 3;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: none;
		border-radius: var(--radius-full);
		background: rgb(255 255 255 / 0.12);
		color: #fff;
		cursor: pointer;
	}

	.flank:hover {
		background: rgb(255 255 255 / 0.22);
	}

	.flank.prev {
		left: var(--space-6);
	}

	.flank.next {
		right: var(--space-6);
	}

	@media (--mobile) {
		.flank {
			display: none;
		}
	}

	.missing {
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.missing p {
		color: white;
	}
</style>
