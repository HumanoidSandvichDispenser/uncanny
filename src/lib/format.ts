import { getLocale } from '$lib/paraglide/runtime';

/**
 * Format a Unix timestamp (seconds) as a short relative time, e.g. "3h", "2d".
 */
export function relativeTime(unixSeconds: number): string {
	const now = Date.now() / 1000;
	const delta = Math.max(0, now - unixSeconds);

	// TODO: localization
	if (delta < 60) {
		return 'now';
	}

	if (delta < 3600) {
		return `${Math.floor(delta / 60)}m`;
	}

	if (delta < 86400) {
		return `${Math.floor(delta / 3600)}h`;
	}

	if (delta < 604800) {
		return `${Math.floor(delta / 86400)}d`;
	}

	const date = new Date(unixSeconds * 1000);
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

	// only show the year when it isn't the current one
	if (date.getFullYear() !== new Date().getFullYear()) {
		options.year = 'numeric';
	}

	return date.toLocaleDateString(undefined, options);
}

/**
 * Format a Unix timestamp (seconds) as a localized clock time, e.g. "2:34 PM".
 */
export function clockTime(unixSeconds: number, locale: string = getLocale()): string {
	return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
		unixSeconds * 1000
	);
}

/**
 * Format a Unix timestamp (seconds) as a localized conversation timestamp:
 * time-only for today, a relative day label for yesterday, the weekday within
 * the last week, otherwise a localized date. Times are client-local.
 */
export function messageDateTime(unixSeconds: number, locale: string = getLocale()): string {
	const date = new Date(unixSeconds * 1000);
	const now = new Date();
	const time = clockTime(unixSeconds, locale);

	const day = startOfDay(date);
	const today = startOfDay(now);

	if (day === today) {
		return time;
	}

	const days = Math.round((today - day) / 86_400_000);

	if (days === 1) {
		const yesterday = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day');
		return `${yesterday} ${time}`;
	}

	if (days > 1 && days < 7) {
		const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
		return `${weekday} ${time}`;
	}

	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

	// only show the year when it isn't the current one, to keep recent dates terse
	if (date.getFullYear() !== now.getFullYear()) {
		options.year = 'numeric';
	}

	return `${new Intl.DateTimeFormat(locale, options).format(date)} ${time}`;
}

function startOfDay(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Format a Unix timestamp (seconds) as a full date and time, e.g. "Mar 6,
 * 2021, 3:45 PM".
 */
export function fullDateTime(unixSeconds: number, locale: string = getLocale()): string {
	return new Date(unixSeconds * 1000).toLocaleString(locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
}

/**
 * Format a Unix timestamp (seconds) as a full calendar date, e.g. "Mar 6,
 * 2021".
 */
export function absoluteDate(unixSeconds: number): string {
	return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Format a Unix timestamp (seconds) as a month and year, e.g. "April 2022".
 */
export function monthYear(unixSeconds: number): string {
	return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long'
	});
}

/**
 * Format a count compactly, e.g. "6.9K".
 */
export function compactNumber(value: number): string {
	return value.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 });
}

export type Anniversary = {
	/**
	 * Whole years elapsed, or null before the first anniversary has come round.
	 */
	years: number | null;

	/** Whether today is that anniversary. */
	isToday: boolean;
};

/**
 * How long ago a date was, and whether today happens to be its anniversary.
 */
export function anniversary(unixSeconds: number): Anniversary {
	const then = new Date(unixSeconds * 1000);
	const now = new Date();

	let years = now.getFullYear() - then.getFullYear();

	// this year's date hasn't come round yet, so a year is still in progress
	if (
		now.getMonth() < then.getMonth() ||
		(now.getMonth() === then.getMonth() && now.getDate() < then.getDate())
	) {
		years -= 1;
	}

	let isToday = now.getMonth() === then.getMonth() && now.getDate() === then.getDate();

	// Feb 29 accounts would otherwise only celebrate every fourth year, so let
	// them have March 1st in the years that don't have a 29th
	if (!isToday && then.getMonth() === 1 && then.getDate() === 29) {
		const leap = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
		isToday = !leap && now.getMonth() === 2 && now.getDate() === 1;
	}

	return { years: years >= 1 ? years : null, isToday };
}

// should probably replace this with a proper color palette according to the
// design system
const AVATAR_COLORS = [
	'#2c5fa2',
	'#1b7a52',
	'#d97706',
	'#c53030',
	'#0284c7',
	'#7c3aed',
	'#be185d',
	'#0f766e'
];

/**
 * Pick a stable accent color for an identity string.
 */
export function avatarColor(seed: string): string {
	let hash = 0;

	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 31 + seed.charCodeAt(i)) | 0;
	}

	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * First character of a name.
 */
export function initial(name: string): string {
	return (name.trim()[0] ?? '?').toUpperCase();
}

/**
 * Absolute URL to a path on the canonical Two Cans & String site.
 */
export function siteUrl(path: string): string {
	return `https://twocansandstring.com${path.startsWith('/') ? '' : '/'}${path}`;
}
