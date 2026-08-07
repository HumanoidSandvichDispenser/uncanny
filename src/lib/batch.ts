import type { Call, BaseClient } from '@sandvichxyz/pecans';

type Enqueue = <T>(call: Call<T>) => Promise<T>;

type Pending = {
	call: Call<unknown>;
	resolve: (value: unknown) => void;
	reject: (error: unknown) => void;
};

function createBatcher(client: BaseClient): Enqueue {
	let queue: Pending[] = [];
	let scheduled = false;

	function flush() {
		const batch = queue;
		queue = [];
		scheduled = false;

		if (batch.length === 0) {
			return;
		}

		if (batch.length === 1) {
			const [only] = batch;
			only.call.then(only.resolve, only.reject);
			return;
		}

		client
			.batch(...batch.map((p) => p.call))
			.then((results) => {
				batch.forEach((p, i) => p.resolve(results[i]));
			})
			.catch((error) => {
				for (const p of batch) {
					p.reject(error);
				}
			});
	}

	return function enqueue<T>(call: Call<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			queue.push({
				call: call as Call<unknown>,
				resolve: resolve as (v: unknown) => void,
				reject
			});

			if (!scheduled) {
				scheduled = true;
				queueMicrotask(flush);
			}
		});
	};
}

const batchers = new WeakMap<BaseClient, Enqueue>();

/**
 * Enqueue a pecans call for batching. Every call enqueued within one tick is
 * flushed as a single `client.batch()` request against the client the call
 * belongs to.
 *
 * @param call The lazy call to send.
 * @returns The call's typed result.
 */
export function batched<T>(call: Call<T>): Promise<T> {
	let enqueue = batchers.get(call.client);

	if (enqueue === undefined) {
		enqueue = createBatcher(call.client);
		batchers.set(call.client, enqueue);
	}

	return enqueue(call);
}
