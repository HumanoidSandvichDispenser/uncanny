import type { CreateQueryResult } from '@tanstack/svelte-query';

type TCResult = { ok: boolean; error?: string };

// a query can fail two ways: the http call throws (tanstack error), or it
// resolves with ok:false at the twocans layer. collapse both into one message,
// or undefined when there's nothing wrong.

/**
 * Gets the error message from a query result, if any.
 *
 * @param query The query result to check for errors.
 * @returns The error message if the query failed, or undefined if there was no error.
 */
export function queryError<T extends TCResult>(query: CreateQueryResult<T>): string | undefined {
	if (query.isError) {
		return query.error.message;
	}

	if (query.isSuccess && !query.data.ok) {
		return query.data.error ?? 'Something went wrong.';
	}

	return undefined;
}
