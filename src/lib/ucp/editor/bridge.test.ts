import { describe, it, expect } from 'vitest';
import { schemaFor } from './schema';
import { fromPM } from './bridge';
import { parse } from '../parse';
import { generate } from '../generate';
import type { Inline, MarkType } from '../ast';

const schema = schemaFor('FORUM');

/** [text, ...markNames] */
type Run = [string, ...MarkType[]];

type InlineJson = string | Run | { type: 'hardBreak' };

function inlines(...runs: InlineJson[]) {
	return runs.map((r) =>
		typeof r === 'string'
			? { type: 'text', text: r }
			: Array.isArray(r)
				? { type: 'text', text: r[0], marks: r.slice(1).map((type) => ({ type })) }
				: r
	);
}

function para(...runs: InlineJson[]) {
	return { type: 'paragraph', content: inlines(...runs) };
}

function heading(...runs: InlineJson[]) {
	return { type: 'heading', content: inlines(...runs) };
}

function listItem(...blocks: object[]) {
	return { type: 'listItem', content: blocks };
}

function list(...items: object[]) {
	return { type: 'list', content: items };
}

function doc(...blocks: object[]) {
	return schema.nodeFromJSON({ type: 'doc', content: blocks });
}

function run(text: string, ...marks: MarkType[]): Inline {
	return { type: 'text', text, marks: marks.map((type) => ({ type }) as never) };
}

describe('fromPM', () => {
	it('converts plain paragraphs', () => {
		expect(fromPM(doc(para('hello'), para('world')))).toEqual({
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [run('hello')] },
				{ type: 'paragraph', content: [run('world')] }
			]
		});
	});

	it('converts marked runs', () => {
		expect(fromPM(doc(para('a ', ['b', 'bold', 'italic'])))).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph', content: [run('a '), run('b', 'bold', 'italic')] }]
		});
	});

	it('converts headings', () => {
		expect(fromPM(doc(heading('title')))).toEqual({
			type: 'doc',
			content: [{ type: 'heading', content: [run('title')] }]
		});
	});

	it('converts a list with items', () => {
		expect(fromPM(doc(list(listItem(para('a')), listItem(para('b')))))).toEqual({
			type: 'doc',
			content: [
				{
					type: 'list',
					items: [
						{ type: 'listItem', content: [{ type: 'paragraph', content: [run('a')] }] },
						{ type: 'listItem', content: [{ type: 'paragraph', content: [run('b')] }] }
					]
				}
			]
		});
	});

	it('converts a nested list', () => {
		expect(fromPM(doc(list(listItem(para('a'), list(listItem(para('b')))))))).toEqual({
			type: 'doc',
			content: [
				{
					type: 'list',
					items: [
						{
							type: 'listItem',
							content: [
								{ type: 'paragraph', content: [run('a')] },
								{
									type: 'list',
									items: [
										{ type: 'listItem', content: [{ type: 'paragraph', content: [run('b')] }] }
									]
								}
							]
						}
					]
				}
			]
		});
	});

	it('converts hard breaks inside a paragraph', () => {
		expect(fromPM(doc(para('a', { type: 'hardBreak' }, 'b')))).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph', content: [run('a'), { type: 'hardBreak' }, run('b')] }]
		});
	});

	it('strips empty paragraphs between full ones', () => {
		expect(fromPM(doc(para('a'), para(), para('b')))).toEqual({
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [run('a')] },
				{ type: 'paragraph', content: [run('b')] }
			]
		});
	});

	it('strips an empty heading', () => {
		expect(fromPM(doc(heading()))).toEqual({ type: 'doc', content: [] });
	});

	it('splits a hard break in a list item into a following paragraph', () => {
		expect(fromPM(doc(list(listItem(para('x', { type: 'hardBreak' }, 'y')))))).toEqual({
			type: 'doc',
			content: [
				{
					type: 'list',
					items: [{ type: 'listItem', content: [{ type: 'paragraph', content: [run('x')] }] }]
				},
				{ type: 'paragraph', content: [run('y')] }
			]
		});
	});

	it('strips an empty list item but keeps the list', () => {
		expect(fromPM(doc(list(listItem(para('a')), listItem(para()))))).toEqual({
			type: 'doc',
			content: [
				{
					type: 'list',
					items: [{ type: 'listItem', content: [{ type: 'paragraph', content: [run('a')] }] }]
				}
			]
		});
	});

	it('drops a list whose items are all empty', () => {
		expect(fromPM(doc(list(listItem(para()))))).toEqual({ type: 'doc', content: [] });
	});

	it('strips a document that is a single empty paragraph', () => {
		expect(fromPM(doc(para()))).toEqual({ type: 'doc', content: [] });
	});

	it('serializes marks in canonical order', () => {
		// marks applied out of MARK_ORDER order
		expect(generate(fromPM(doc(para(['x', 'code', 'bold']))))).toBe('<b><code>x</code></b>');
	});

	it('round-trips editor-produced documents', () => {
		const docs = [
			doc(para('a'), para(), para('b')),
			doc(para()),
			doc(para(), para('trailing')),
			doc(para('leading'), para()),
			doc(para(), para()),
			doc(para(['bold', 'bold']), para('plain')),
			doc(heading('title'), para('body')),
			doc(heading()),
			doc(list(listItem(para('a')), listItem(para('b')))),
			doc(list(listItem(para('a'), list(listItem(para('b')))))),
			doc(list(listItem(para('a')), listItem(para()))),
			doc(list(listItem(para()))),
			doc(para('a', { type: 'hardBreak' }, 'b')),
			doc(heading(['t', 'bold']), list(listItem(para('x', { type: 'hardBreak' }, 'y'))))
		];
		for (const d of docs) {
			const ast = fromPM(d);
			expect(parse(generate(ast))).toEqual(ast);
		}
	});
});
