import { Client } from '@sandvichxyz/pecans';
import { SvelteMap } from 'svelte/reactivity';
import { profileCache } from './profiles.svelte';

const STORE_KEY = 'tc_accounts';

function browserClient(token?: string): Client {
	const client = new Client(token);

	// pass through CORS
	client.agent = undefined as unknown as string;

	client.profileCache = profileCache;

	return client;
}

type StoredAccount = {
	id: string;
	username: string;
	authToken: string;
};

class Account {
	id: string;
	username = $state('');
	authToken: string;
	client: Client;

	constructor(data: StoredAccount) {
		this.id = data.id;
		this.username = data.username;
		this.authToken = data.authToken;
		this.client = browserClient(data.authToken);

		// all clients share the same profile cache
		this.client.profileCache = profileCache;
	}

	toJSON(): StoredAccount {
		return {
			id: this.id,
			username: this.username,
			authToken: this.authToken
		};
	}
}

class Accounts {
	map = new SvelteMap<string, Account>();
	activeId = $state<string | undefined>(undefined);

	get active(): Account | undefined {
		return this.activeId ? this.map.get(this.activeId) : undefined;
	}

	get client(): Client | undefined {
		return this.active?.client;
	}

	get isAuthed() {
		return this.activeId !== undefined && this.map.has(this.activeId);
	}

	constructor() {
		this.#load();
	}

	async add(username: string, password: string) {
		const c = browserClient();
		const res = await c.auth.login(username, password);

		if (!res.success) {
			throw new Error(`Failed to login: ${res.error}`);
		}

		let name = res.profiles?.find((p) => p.id == res.yourId)?.name ?? username;

		const account = new Account({
			id: res.yourId,
			username: name,
			authToken: res.authToken
		});

		this.map.set(account.id, account);
		this.activeId = account.id;
		this.#save();

		return account;
	}

	async remove(id: string) {
		const account = this.map.get(id);
		if (account === undefined) {
			throw new Error(`Account ${id} not found`);
		}

		const res = await account.client.auth.logout();
		if (res.error) {
			// unable to logout but shouldn't happen
			throw new Error(`Failed to logout account ${id}: ${res.error}`);
		}

		this.map.delete(id);

		// if we removed the active account, fall back to any remaining one
		if (this.activeId === id) {
			this.activeId = this.map.keys().next().value;
		}

		this.#save();
	}

	switch(id: string) {
		if (this.map.has(id)) {
			this.activeId = id;
			this.#save();
		}
	}

	#load() {
		const raw = localStorage.getItem(STORE_KEY);
		if (!raw) {
			return;
		}

		const { accounts, activeId } = JSON.parse(raw) as {
			accounts: StoredAccount[];
			activeId?: string;
		};

		for (const stored of accounts) {
			this.map.set(stored.id, new Account(stored));
		}

		if (activeId && this.map.has(activeId)) {
			this.activeId = activeId;
		}
	}

	#save() {
		const accounts = [...this.map.values()].map((a) => a.toJSON());
		localStorage.setItem(STORE_KEY, JSON.stringify({ accounts, activeId: this.activeId }));
	}
}

export const accounts = new Accounts();
