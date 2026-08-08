<script lang="ts">
	import { createQuery, createQueries } from '@tanstack/svelte-query';
	import { accounts } from '$lib/accounts.svelte';
	import { identity, getProfile } from '$lib/profiles.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import FollowButton from '$lib/components/follows/FollowButton.svelte';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import CalendarBlankIcon from 'phosphor-svelte/lib/CalendarBlankIcon';
	import CakeIcon from 'phosphor-svelte/lib/CakeIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import { monthYear, anniversary, relativeTime, compactNumber } from '$lib/format';
	import { batched } from '$lib/batch';
	import Ucp from '$lib/ucp/components/Ucp.svelte';

	let { userId }: { userId: string } = $props();

	const info = $derived(identity(userId));
	const isSelf = $derived(accounts.activeId === userId);

	const subs = $derived(getProfile(userId)?.subs);

	const profileQuery = createQuery(() => ({
		queryKey: ['profile', userId],
		queryFn: () => batched(accounts.active!.client.profile.get(userId, true)),
		enabled: accounts.isAuthed,
		staleTime: 30_000
	}));

	const following = $derived(profileQuery.data?.follow?.following ?? null);

	// each field is its own call but batched in one request
	const FIELDS = {
		title: String,
		blurb: String,
		joinTime: Number,
		questions: Number,
		answers: Number,
		forumPosts: Number
	};

	type Field = keyof typeof FIELDS;
	type Details = { [K in Field]: ReturnType<(typeof FIELDS)[K]> | undefined } & {
		isPending: boolean;
	};

	const names = Object.keys(FIELDS) as Field[];

	const details = createQueries(() => ({
		queries: names.map((field) => ({
			queryKey: ['profile', userId, field],
			queryFn: () => batched(accounts.active!.client.profile.details(userId, field)),
			enabled: accounts.isAuthed,
			staleTime: 30_000
		})),
		combine: (results) =>
			({
				...Object.fromEntries(
					names.map((field, i) => {
						const value = results[i].data?.value;
						return [field, value === undefined ? undefined : FIELDS[field](value)];
					})
				),
				isPending: results.some((r) => r.isPending)
			}) as Details
	}));

	const joined = $derived(
		details.joinTime === undefined ? null : anniversary(details.joinTime)
	);

	const lastSeen = $derived(getProfile(userId)?.online);
	const isOnline = $derived(lastSeen !== undefined && Date.now() / 1000 - lastSeen < 5 * 60);
</script>

<header class="profile-header">
	<div class="avatar">
		<UserAvatar name={userId} size={96} square shadow antialias={false} />
	</div>

	<div class="identity">
		<h1 class="name h2">
			{info.name}
			{#if info.isAdmin}
				<ShieldCheckIcon />
			{/if}
		</h1>

		<p class="meta text-sm">
			<span class="id">@{info.id}</span>
			{#if details.isPending}
				<span class="sep" aria-hidden="true">&middot;</span>
				<Skeleton text width="7ch" />
			{:else if details.title}
				<span class="sep" aria-hidden="true">&middot;</span>
				<span class="title">{details.title}</span>
			{/if}
		</p>

		<p class="social stats text-sm">
			{#if subs === undefined}
				<Skeleton text width="6rem" />
				<Skeleton text width="6rem" />
			{:else if isSelf}
				<a href="/follows?tab=followers">
					<strong>{compactNumber(subs?.in ?? 0)}</strong> followers
				</a>
				<a href="/follows?tab=following">
					<strong>{compactNumber(subs?.out ?? 0)}</strong> following
				</a>
			{:else}
				<span><strong>{compactNumber(subs?.in ?? 0)}</strong> followers</span>
				<span><strong>{compactNumber(subs?.out ?? 0)}</strong> following</span>
			{/if}
		</p>
	</div>

	{#if details.isPending}
		<div class="blurb">
			<Skeleton text lines={2} />
		</div>
	{:else if details.blurb}
		<div class="blurb">
			<Ucp text={details.blurb} context="PROFILE" />
		</div>
	{/if}

	<p class="counts stats text-sm">
		{#if details.isPending}
			<Skeleton text width="5.5rem" />
			<Skeleton text width="6rem" />
			<Skeleton text width="4.5rem" />
		{:else}
			<span><strong>{compactNumber(details.answers ?? 0)}</strong> answers</span>
			<span><strong>{compactNumber(details.questions ?? 0)}</strong> questions</span>
			<span><strong>{compactNumber(details.forumPosts ?? 0)}</strong> posts</span>
		{/if}
	</p>

		<p class="dates text-sm">
			{#if details.isPending}
				<Skeleton text width="9rem" />
			{:else if joined && details.joinTime !== undefined}
				<span class="date" class:cake={joined.isToday}>
					{#if joined.isToday}
						<CakeIcon weight="fill" />
					{:else}
						<CalendarBlankIcon />
					{/if}
					Joined {monthYear(details.joinTime)}
					{#if joined.isToday && joined.years}
						&middot; {joined.years} {joined.years === 1 ? 'year' : 'years'} today
					{/if}
				</span>
			{/if}

			{#if lastSeen !== undefined}
				<span class="date">
					{#if isOnline}
						<span class="dot" aria-hidden="true"></span>
						Online now
					{:else}
						<ClockIcon />
						Last seen {relativeTime(lastSeen)}
					{/if}
				</span>
			{/if}
		</p>

		<div class="actions">
			{#if !isSelf}
				<!-- until it loads we don't know which way round the button goes -->
				{#if following !== null}
					<FollowButton {userId} {following} />
				{:else}
					<Skeleton class="btn-placeholder" height="2rem" width="5.5rem" />
				{/if}
				<!-- TODO: messages.startConversation(title, body, [userId]) -->
				<button class="btn btn-sm btn-secondary text-sm" disabled>Message</button>
			{:else}
				<!-- TODO: profile.edit(field, value) -->
				<button class="btn btn-sm btn-secondary text-sm" disabled>Edit profile</button>
			{/if}
	</div>
</header>

<style>
	.profile-header {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		column-gap: var(--space-gap-lg);
		padding: var(--space-padding-lg) 0;
		grid-template-areas:
			'avatar identity'
			'avatar blurb'
			'avatar counts'
			'avatar dates'
			'avatar actions';

		@media (--mobile) {
			column-gap: var(--space-gap-md);
			padding: var(--space-padding-md) var(--space-padding-sm);
			grid-template-areas:
				'avatar identity'
				'blurb blurb'
				'counts counts'
				'dates dates'
				'actions actions';
		}
	}

	.avatar {
		grid-area: avatar;
	}

	.identity {
		grid-area: identity;

		@media (--mobile) {
			align-self: center;
		}
	}

	.blurb {
		grid-area: blurb;
	}

	.counts {
		grid-area: counts;
	}

	.dates {
		grid-area: dates;
	}

	.name {
		display: flex;
		align-items: center;
		gap: var(--space-gap-xs);
		margin: 0;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-gap-xs);
		margin: 0;
		color: var(--color-text-secondary);
	}

	.meta .sep {
		color: var(--color-text-tertiary);
	}

	.title {
		font-style: italic;
	}

	.blurb {
		margin: var(--space-gap-xs) 0 0;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-gap-md);
		margin: var(--space-gap-xs) 0 0;
		color: var(--color-text-secondary);
	}

	.stats strong {
		color: var(--color-text);
	}

	.stats a {
		color: var(--color-text-secondary);
		text-decoration: none;
	}

	.dates {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-gap-md);
		margin: var(--space-gap-xs) 0 0;
		color: var(--color-text-tertiary);
	}

	.date {
		display: inline-flex;
		align-items: center;
		gap: var(--space-gap-xs);
	}

	.date.cake {
		color: var(--color-accent-500);
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--radius-full);
		background: var(--color-success-500);
	}

	.actions {
		grid-area: actions;
		display: flex;
		gap: var(--space-gap-sm);
		margin-top: var(--space-gap-sm);
	}

	@media (--mobile) {
		.actions :global(.btn),
		.actions :global(.btn-placeholder) {
			flex: 1;
		}
	}
</style>
