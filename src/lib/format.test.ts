import { describe, it, expect } from 'vitest';
import { clockTime, messageDateTime } from './format';

const LOCALE = 'en-US';

function seconds(date: Date): number {
	return date.getTime() / 1000;
}

function daysAgo(days: number): Date {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
}

describe('messageDateTime', () => {
	it('shows only the time for today', () => {
		const now = new Date();
		expect(messageDateTime(seconds(now), LOCALE)).toBe(clockTime(seconds(now), LOCALE));
	});

	it('labels yesterday relatively', () => {
		const yesterday = daysAgo(1);
		expect(messageDateTime(seconds(yesterday), LOCALE)).toBe(
			`yesterday ${clockTime(seconds(yesterday), LOCALE)}`
		);
	});

	it('shows the weekday within the last week', () => {
		const date = daysAgo(3);
		const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(date);
		expect(messageDateTime(seconds(date), LOCALE)).toBe(
			`${weekday} ${clockTime(seconds(date), LOCALE)}`
		);
	});

	it('shows a date for older messages', () => {
		const date = new Date();
		date.setDate(date.getDate() - 30);
		date.setHours(9, 5, 0, 0);

		const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

		if (date.getFullYear() !== new Date().getFullYear()) {
			options.year = 'numeric';
		}

		const expected = new Intl.DateTimeFormat(LOCALE, options).format(date);

		expect(messageDateTime(seconds(date), LOCALE)).toBe(
			`${expected} ${clockTime(seconds(date), LOCALE)}`
		);
	});

	it('includes the year when it differs from the current one', () => {
		const date = new Date();
		date.setFullYear(date.getFullYear() - 1);
		date.setMonth(2, 5);
		date.setHours(9, 5, 0, 0);

		const expected = new Intl.DateTimeFormat(LOCALE, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(date);

		expect(messageDateTime(seconds(date), LOCALE)).toBe(
			`${expected} ${clockTime(seconds(date), LOCALE)}`
		);
	});
});

describe('clockTime', () => {
	it('formats a localized clock time', () => {
		expect(clockTime(seconds(new Date(2026, 0, 15, 14, 34)), LOCALE)).toBe('2:34 PM');
	});
});
