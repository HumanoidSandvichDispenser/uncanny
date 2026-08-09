import { describe, it, expect } from 'vitest';
import { schema } from './schema';
import { fromPM } from './bridge';
import { parse } from '../parse';
import { generate } from '../generate';
import type { Inline, MarkType } from '../ast';

/** [text, ...markNames] */
type Run = [string, ...MarkType[]];

function para(...runs: (string | Run)[]) {
	return {
		type: 'paragraph',
		content: runs.map((r) =>
			typeof r === 'string'
				? { type: 'text', text: r }
				: { type: 'text', text: r[0], marks: r.slice(1).map((type) => ({ type })) }
		)
	};
}

function doc(...paras: object[]) {
	return schema.nodeFromJSON({ type: 'doc', content: paras });
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

	it('strips empty paragraphs between full ones', () => {
		expect(fromPM(doc(para('a'), para(), para('b')))).toEqual({
			type: 'doc',
			content: [
				{ type: 'paragraph', content: [run('a')] },
				{ type: 'paragraph', content: [run('b')] }
			]
		});
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
			doc(para(['bold', 'bold']), para('plain'))
		];
		for (const d of docs) {
			const ast = fromPM(d);
			expect(parse(generate(ast))).toEqual(ast);
		}
	});
});
