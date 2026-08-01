import { DismissAction } from '@sandvichxyz/pecans';
import type { AnswerQuestion } from '@sandvichxyz/pecans';
import { accounts } from '$lib/accounts.svelte';

export class AnswerQueue {
	question = $state<AnswerQuestion | null>(null);
	loading = $state(true);
	busy = $state(false);
	error = $state<string | null>(null);
	reply = $state('');
	drained = $state(false);

	private get client() {
		return accounts.active?.client ?? null;
	}

	async loadNext() {
		const client = this.client;
		if (!client) {
			return;
		}

		this.loading = true;
		this.error = null;
		this.reply = '';

		try {
			const res = await client.answer.fetchNext();
			if (!res.ok || !res.id) {
				this.question = null;
				this.drained = true;
			} else {
				this.question = res;
				this.drained = false;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Could not load a question';
		} finally {
			this.loading = false;
		}
	}

	async loadQueued(id: number) {
		const client = this.client;
		if (!client) {
			return;
		}

		this.loading = true;
		this.error = null;
		this.reply = '';

		try {
			const res = await client.answer.queueQuestion(id);
			if (!res.ok || !res.id) {
				await this.loadNext();
				return;
			}
			this.question = res;
			this.drained = false;
		} catch {
			await this.loadNext();
		} finally {
			this.loading = false;
		}
	}

	async submitReply() {
		const client = this.client;
		const q = this.question;
		const text = this.reply.trim();

		if (!client || !q || !text || this.busy) {
			return;
		}

		this.busy = true;
		this.error = null;

		try {
			const res = await client.answer.reply(q.id, text);
			if (!res.ok) {
				throw new Error(res.error || 'Answer was rejected');
			}
			await this.loadNext();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Could not post answer';
		} finally {
			this.busy = false;
		}
	}

	async dismiss(action: DismissAction) {
		const client = this.client;
		const q = this.question;
		if (!client || !q || this.busy) {
			return;
		}

		this.busy = true;
		this.error = null;

		try {
			await client.answer.dismissQuestion(q.id, action);
			await this.loadNext();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Could not dismiss question';
		} finally {
			this.busy = false;
		}
	}

	async snooze() {
		await this.dismiss(DismissAction.SNOOZE);
	}

	async discard() {
		await this.dismiss(DismissAction.DISCARD);
	}

	async save() {
		const client = this.client;
		const q = this.question;
		if (!client || !q || this.busy) {
			return;
		}

		this.busy = true;
		this.error = null;

		try {
			await client.answer.queueQuestion(q.id);
			await this.loadNext();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Could not save question';
		} finally {
			this.busy = false;
		}
	}

	async vote(optionNum: number) {
		const client = this.client;
		const q = this.question;

		if (!client || !q || !q.poll || q.poll.answered || this.busy) {
			return;
		}

		this.busy = true;
		this.error = null;

		try {
			const res = await client.answer.pollVote(q.id, optionNum);
			if (!res.ok) {
				throw new Error(res.error || 'Vote was rejected');
			}

			q.poll.answered = true;
			const opt = q.poll.options[optionNum];

			if (opt) {
				opt.yours = true;
				opt.votes = (opt.votes ?? 0) + 1;
			}
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Could not record vote';
		} finally {
			this.busy = false;
		}
	}
}

/** Total votes across a poll. */
export function pollTotal(q: AnswerQuestion): number {
	return (q.poll?.options ?? [])
		.reduce((sum, o) => sum + (o.votes ?? 0), 0);
}
