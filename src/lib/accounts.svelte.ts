import { Client } from '@sandvichxyz/pecans';
import { SvelteMap } from 'svelte/reactivity';
import { profileCache } from './profiles.svelte';

const STORE_KEY = 'tc_accounts';

function browserClient(token?: string): Client {
	const client = new Client(token);

	// pass through CORS
	client.agent = undefined;

	// all clients share the same profile cache
	client.profileCache = profileCache;

	return client;
}

type StoredAccount = {
	id: string;
	username: string;
	avatar?: string;
	authToken: string;
};

class Account {
	id: string;
	username = $state('');
	authToken: string;
	client: Client;
	avatar = $state<string | undefined>(undefined);

	constructor(data: StoredAccount) {
		this.id = data.id;
		this.username = data.username;
		this.authToken = data.authToken;
		this.avatar = data.avatar;
		this.client = browserClient(data.authToken);
	}

	async validate(): Promise<boolean> {
		try {
			const res = await this.client.auth.existingCookie(this.authToken);
			return res.success;
		} catch {
			// assume validated if the request fails (e.g. network error) so we don't
			// log the user out unnecessarily
			return true;
		}
	}

	toJSON(): StoredAccount {
		return {
			id: this.id,
			username: this.username,
			authToken: this.authToken,
			avatar: this.avatar
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
		void this.#rehydrate();
	}

	async add(username: string, password: string) {
		const c = browserClient();
		const res = await c.auth.login(username, password);

		if (!res.success) {
			throw new Error(`Failed to login: ${res.error}`);
		}

		const me = res.profiles?.find((p) => p.id == res.yourId);
		const name = me?.name ?? username;

		const account = new Account({
			id: res.yourId,
			username: name,
			avatar: me?.avatar,
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

			if (stored.avatar) {
				profileCache[stored.id] ??= {
					id: stored.id,
					name: stored.username,
					avatar: stored.avatar,
					subs: {
						in: 0,
						out: 0
					},
					online: Date.now()
				};
			}
		}

		if (activeId && this.map.has(activeId)) {
			this.activeId = activeId;
		}
	}

	async #rehydrate() {
		const stored = [...this.map.values()];

		if (stored.length === 0) {
			return;
		}

		if (this.active === undefined) {
			return;
		}

		const isValidated = await this.active.validate();

		if (!isValidated) {
			this.map.delete(this.active.id);

			// if we removed the active account, fall back to any remaining one
			this.activeId = this.map.keys().next().value;

			// TODO: clear tanstack query cache
		}

		this.#save();
	}

	#save() {
		const accounts = [...this.map.values()].map((a) => a.toJSON());
		localStorage.setItem(STORE_KEY, JSON.stringify({ accounts, activeId: this.activeId }));
	}
}

export const accounts = new Accounts();
