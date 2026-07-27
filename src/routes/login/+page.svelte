<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { accounts } from '$lib/accounts.svelte';

	let username = $state('');
	let password = $state('');

	const login = createMutation(() => ({
		mutationFn: () => accounts.add(username, password),
		onSuccess: () => {
			goto('/');
		}
	}));

	function submit(e: SubmitEvent) {
		e.preventDefault();
		login.mutate();
	}

	const hasAccounts = $derived(accounts.map.size > 0);
</script>

<main class="page">
	<form class="card" onsubmit={submit}>
		<header>
			<h3>{hasAccounts ? 'Add an account' : 'Sign in'}</h3>
			<p class="text-sm subtitle">to Two Cans &amp; String</p>
		</header>

		<label class="field">
			<span class="label-xs">Username</span>
			<input
				class="input"
				type="text"
				autocomplete="username"
				bind:value={username}
				disabled={login.isPending}
				required
			/>
		</label>

		<label class="field">
			<span class="label-xs">Password</span>
			<input
				class="input"
				type="password"
				autocomplete="current-password"
				bind:value={password}
				disabled={login.isPending}
				required
			/>
		</label>

		{#if login.isError}
			<p class="text-sm error">{login.error.message}</p>
		{/if}

		<button class="btn btn-primary label-md" type="submit" disabled={login.isPending}>
			{#if login.isPending}
				Signing in&hellip;
			{:else}
				Sign in
			{/if}
		</button>

		{#if hasAccounts}
			<a class="text-sm back" href="/">Back</a>
		{/if}
	</form>
</main>

<style>
	.page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: var(--space-padding-md);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-gap-md);
		width: 100%;
		max-width: var(--width-form);
		padding: var(--space-padding-xl);
		background: var(--color-bg-card);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-md);
	}

	header {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-2);
	}

	.subtitle {
		color: var(--color-text-secondary);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field .label-xs {
		color: var(--color-text-secondary);
	}

	.input {
		padding: var(--space-2) var(--space-3);
		color: var(--color-text);
		background: var(--color-bg-page);
		border: var(--border-thin) solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.input:disabled {
		opacity: 0.6;
	}

	.error {
		color: var(--color-error);
	}

	.back {
		align-self: center;
		color: var(--color-text-secondary);
	}
</style>
