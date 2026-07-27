import { SvelteMap } from 'svelte/reactivity';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { accounts } from './accounts.svelte';

const urls = new SvelteMap<string, string>();

const pending = new Set<string>();

// ids that are awaiting next network fetch
let queue = new Set<string>();
let flushScheduled = false;

/**
 * Data URL for an image id, or null while unknown/loading. The returned value
 * is cached and reactive, so any time the image is loaded, the value will
 * update automatically.
 */
export function imageUrl(imageId: string): string | null {
	const cached = urls.get(imageId);

	if (cached) {
		return cached;
	}

	if (!pending.has(imageId)) {
		pending.add(imageId);
		void resolve(imageId);
	}

	return null;
}

async function resolve(imageId: string) {
	const stored = await idbGet<string>(imageId);

	if (stored) {
		urls.set(imageId, stored);
		pending.delete(imageId);
		return;
	}

	enqueue(imageId);
}

function enqueue(imageId: string) {
	queue.add(imageId);

	if (!flushScheduled) {
		flushScheduled = true;
		setTimeout(flush, 0);
	}
}

async function flush() {
	const ids = [...queue];
	queue = new Set();
	flushScheduled = false;

	const client = accounts.active?.client;

	if (!client) {
		for (const id of ids) {
			pending.delete(id);
		}

		return;
	}

	try {
		const res = await client.images.batchGet(ids);

		for (const img of res.items ?? []) {
			const b64 = img.data.startsWith('B64') ? img.data.slice(3) : img.data;

			const url = `data:image/png;base64,${b64}`;
			urls.set(img.id, url);

			void idbSet(img.id, url);
		}
	} catch {
	} finally {
		for (const id of ids) {
			pending.delete(id);
		}
	}
}
