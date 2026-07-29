import { describe, it, expect } from 'vitest';
import { parse, parseInline } from './parse';
import { generate } from './generate';
import { FEATURES, type Block, type Inline } from './ast';

const forum = FEATURES.FORUM;

function inline(text: string): Inline[] {
	return parseInline(text, forum);
}

function run(text: string, ...marks: string[]) {
	return { type: 'text', text, marks: marks.map(markOf) };
}

function markOf(spec: string) {
	if (spec.startsWith('color:')) {
		return { type: 'color', color: spec.slice(6) };
	}
	if (spec.startsWith('link:')) {
		return { type: 'link', href: spec.slice(5) };
	}
	return { type: spec };
}

describe('inline parsing', () => {
	it('parses plain text', () => {
		expect(inline('hello world')).toEqual([run('hello world')]);
	});

	it('parses a single mark', () => {
		expect(inline('<b>hi</b>')).toEqual([run('hi', 'bold')]);
	});

	it('unions nested marks onto the run', () => {
		expect(inline('<b><i>x</i></b>')).toEqual([run('x', 'bold', 'italic')]);
	});

	it('auto-closes an unclosed tag at end of line', () => {
		expect(inline('a <b>bold')).toEqual([run('a '), run('bold', 'bold')]);
	});

	it('renders an orphan close tag as literal text', () => {
		expect(inline('a</b>b')).toEqual([run('a</b>b')]);
	});

	it('drops redundant same-tag nesting', () => {
		expect(inline('<b><b>x</b></b>')).toEqual([run('x', 'bold')]);
	});

	it('treats mismatched overlap by literalizing the bad closer', () => {
		// </b> mismatches the innermost open (i) -> literalized inside the b+i
		// context; adjacent same-mark runs then merge.
		const out = inline('<b><i>x</b>y</i>');
		expect(out).toEqual([run('x</b>y', 'bold', 'italic')]);
	});

	it('parses inline code verbatim', () => {
		expect(inline('<code><b>not bold</b></code>')).toEqual([run('<b>not bold</b>', 'code')]);
	});

	it('autolinks a bare url', () => {
		expect(inline('see https://x.com/a')).toEqual([
			run('see '),
			run('https://x.com/a', 'link:https://x.com/a')
		]);
	});

	it('balances brackets when autolinking', () => {
		expect(inline('(https://x.com/a)')).toEqual([
			run('('),
			run('https://x.com/a', 'link:https://x.com/a'),
			run(')')
		]);
	});

	it('parses a color tag', () => {
		expect(inline('<red>hot</red>')).toEqual([run('hot', 'color:red')]);
	});
});

describe('block parsing', () => {
	it('splits paragraphs on blank lines', () => {
		const doc = parse('a\n\nb');
		expect(doc.content).toEqual([
			{ type: 'paragraph', content: [run('a')] },
			{ type: 'paragraph', content: [run('b')] }
		]);
	});

	it('joins consecutive text lines with a hard break', () => {
		const doc = parse('a\nb');
		expect(doc.content).toEqual([
			{ type: 'paragraph', content: [run('a'), { type: 'hardBreak' }, run('b')] }
		]);
	});

	it('parses a heading', () => {
		const doc = parse('!Title');
		expect(doc.content).toEqual([{ type: 'heading', content: [run('Title')] }]);
	});

	it('parses an anonymous quote', () => {
		const doc = parse('>>>QUOTE\nhi\n<<<QUOTE');
		expect(doc.content).toEqual([
			{ type: 'quote', source: null, content: [{ type: 'paragraph', content: [run('hi')] }] }
		]);
	});

	it('parses a user-sourced quote', () => {
		const doc = parse('>>>QUOTE:@alice\nhi\n<<<QUOTE');
		expect((doc.content[0] as { source: unknown }).source).toEqual({ kind: 'user', id: 'alice' });
	});

	it('parses a text-sourced quote', () => {
		const doc = parse('>>>QUOTE:Some Book\nhi\n<<<QUOTE');
		expect((doc.content[0] as { source: unknown }).source).toEqual({
			kind: 'text',
			text: 'Some Book'
		});
	});

	it('auto-closes an unterminated quote at EOF', () => {
		const doc = parse('>>>QUOTE\nhi');
		expect(doc.content[0].type).toBe('quote');
	});

	it('literalizes an orphan quote close', () => {
		const doc = parse('<<<QUOTE');
		expect(doc.content).toEqual([{ type: 'paragraph', content: [run('<<<QUOTE')] }]);
	});

	it('parses a code block', () => {
		const doc = parse('```ts\nconst x = 1;\n```');
		expect(doc.content).toEqual([{ type: 'codeBlock', lang: 'ts', code: 'const x = 1;' }]);
	});

	it('runs an unterminated code block to EOF', () => {
		const doc = parse('```\na\nb');
		expect(doc.content).toEqual([{ type: 'codeBlock', lang: null, code: 'a\nb' }]);
	});

	it('parses a flat list', () => {
		const doc = parse('- one\n- two');
		expect(doc.content).toEqual([
			{
				type: 'list',
				items: [
					{ type: 'listItem', content: [{ type: 'paragraph', content: [run('one')] }] },
					{ type: 'listItem', content: [{ type: 'paragraph', content: [run('two')] }] }
				]
			}
		]);
	});

	it('nests a deeper list under the previous item', () => {
		const doc = parse('- a\n  - b');
		const list = doc.content[0] as { items: Array<{ content: Block[] }> };
		expect(list.items[0].content[1]).toEqual({
			type: 'list',
			items: [{ type: 'listItem', content: [{ type: 'paragraph', content: [run('b')] }] }]
		});
	});

	it('parses a headerless table', () => {
		const doc = parse('| a | b |\n| c | d |');
		expect(doc.content[0]).toEqual({
			type: 'table',
			header: null,
			align: ['left', 'left'],
			rows: [
				{ type: 'tableRow', cells: [cell('a'), cell('b')] },
				{ type: 'tableRow', cells: [cell('c'), cell('d')] }
			]
		});
	});

	it('detects a header/alignment row', () => {
		const doc = parse('| a | b |\n| :-: | --: |\n| c | d |');
		const table = doc.content[0] as { header: unknown; align: unknown; rows: unknown[] };
		expect(table.align).toEqual(['center', 'right']);
		expect(table.header).toEqual({ type: 'tableRow', cells: [cell('a'), cell('b')] });
		expect(table.rows).toHaveLength(1);
	});

	it('parses an image with http upgraded to https', () => {
		const doc = parse('>>>IMAGE:http://x.com/a.png');
		expect(doc.content).toEqual([{ type: 'image', url: 'https://x.com/a.png' }]);
	});

	it('parses a multi-line spoiler', () => {
		const doc = parse('<spoiler>\nsecret\n</spoiler>');
		expect(doc.content).toEqual([
			{ type: 'mspoiler', content: [{ type: 'paragraph', content: [run('secret')] }] }
		]);
	});
});

function cell(text: string) {
	return { type: 'tableCell', content: [run(text)] };
}

describe('context feature gating', () => {
	it('does not parse quotes outside quote-enabled contexts', () => {
		const doc = parse('>>>QUOTE\nhi\n<<<QUOTE', 'CHAT');
		expect(doc.content.every((b) => b.type !== 'quote')).toBe(true);
	});

	it('collapses to a single line when multiline is off (poll)', () => {
		const doc = parse('a\nb', 'QA_POLL');
		expect(doc.content).toEqual([{ type: 'paragraph', content: [run('a b')] }]);
	});
});

describe('round-trip: parse(generate(ast)) === ast', () => {
	const samples: string[] = [
		'hello world',
		'a\n\nb',
		'a\nb',
		'<b>bold</b> and <i>italic</i>',
		'<b><i>both</i></b>',
		'<red>colored</red> text',
		'see https://example.com/path',
		'!A Heading',
		'>>>QUOTE\nquoted\n<<<QUOTE',
		'>>>QUOTE:@bob\nhi bob\n<<<QUOTE',
		'>>>QUOTE:A Source\nlabeled\n<<<QUOTE',
		'```ts\nconst x = 1;\n```',
		'- one\n- two\n- three',
		'| a | b |\n| :-: | --: |\n| c | d |',
		'| a | b |\n| c | d |',
		'>>>IMAGE:https://x.com/a.png',
		'<spoiler>\nsecret\n</spoiler>',
		'para one\n\n>>>QUOTE:@alice\nnested <b>bold</b>\n<<<QUOTE\n\npara two'
	];

	for (const src of samples) {
		it(`is a fixed point for: ${JSON.stringify(src)}`, () => {
			const once = parse(src);
			const twice = parse(generate(once));
			expect(twice).toEqual(once);
		});
	}
});
