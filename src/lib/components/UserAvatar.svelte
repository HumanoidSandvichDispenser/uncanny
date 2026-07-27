<script lang="ts">
	import { avatarColor, initial } from '$lib/format';
	import { anonSeed, youAnonRealId } from '$lib/anon';
	import { getProfile, displayName } from '$lib/profiles.svelte';
	import { imageUrl } from '$lib/imageCache.svelte';
	import Identicon from './Identicon.svelte';

	let {
		name,
		size = 36,
		status = false,
		square = false
	}: { name: string; size?: number; status?: boolean; square?: boolean } = $props();

	const seed = $derived(anonSeed(name));

	const youRealId = $derived(youAnonRealId(name));
	const realId = $derived(youRealId ?? name);
	const isYouAnon = $derived(youRealId !== null);

	const label = $derived(displayName(realId));
	const profile = $derived(getProfile(realId));
	// the API uses "blank" as the id for users with no avatar set
	const avatarId = $derived(profile?.avatar && profile.avatar !== 'blank' ? profile.avatar : null);
	const avatar = $derived(avatarId ? imageUrl(avatarId) : null);

	const accent = $derived(avatarColor(realId));

	const statusLevel = $derived.by<'online' | 'recent' | null>(() => {
		if (!status || seed || isYouAnon) {
			return null;
		}

		const online = profile?.online;
		if (!online) {
			return null;
		}

		const delta = Date.now() / 1000 - online;

		// TODO: l10n
		if (delta < 300) {
			return 'online';
		}

		if (delta < 1800) {
			return 'recent';
		}

		return null;
	});

	const statusLabel = $derived(statusLevel === 'online' ? 'Online' : 'Recently active');
	const dot = $derived(Math.max(8, Math.round(size * 0.3)));
</script>

<span class="wrap">
	{#if seed}
		<span
			class="avatar anon"
			class:square
			style:width="{size}px"
			style:height="{size}px"
			style:color={accent}
			title="Anonymous"
			aria-label="Anonymous"
		>
			<Identicon {seed} />
		</span>
	{:else if avatar}
		<img
			class="avatar"
			class:you-anon={isYouAnon}
			class:square
			src={avatar}
			alt={label}
			title={label}
			style:width="{size}px"
			style:height="{size}px"
			style:border-color={isYouAnon ? accent : undefined}
		/>
	{:else}
		<span
			class="avatar initials"
			class:you-anon={isYouAnon}
			class:square
			title={label}
			style:width="{size}px"
			style:height="{size}px"
			style:font-size="{Math.round(size * 0.38)}px"
			style:background={accent}
			style:border-color={isYouAnon ? accent : undefined}
		>
			{initial(label)}
		</span>
	{/if}

	{#if statusLevel}
		<span
			class="status-dot {statusLevel}"
			style:width="{dot}px"
			style:height="{dot}px"
			title={statusLabel}
			aria-label={statusLabel}
		></span>
	{/if}
</span>

<style>
	.wrap {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
	}

	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		object-fit: cover;
		overflow: hidden;
	}

	.initials {
		color: #fff;
		font-family: var(--font-ui);
		font-weight: 600;
		line-height: 1;
	}

	.avatar.square {
		border-radius: 0;
		image-rendering: pixelated;
	}

	.anon {
		border: var(--border-normal) dashed currentColor;
		background: transparent;
		padding: 2px;
		opacity: 0.35;
	}

	.you-anon {
		box-sizing: border-box;
		border: var(--border-normal) dashed;
		opacity: 0.65;
	}

	.status-dot {
		position: absolute;
		right: 0;
		bottom: 0;
		border-radius: var(--radius-full);
		box-shadow: 0 0 0 2px var(--color-bg-card);
	}

	.status-dot.online {
		background: var(--color-success-500);
	}

	.status-dot.recent {
		background: var(--color-warning-500);
	}
</style>
