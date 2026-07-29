/**
 * UCP generator: AST -> text. The inverse-ish of `parse.ts`.
 *
 * UCP is lossy, so the contract is idempotent round-trip on the AST (grammar §7):
 *   parse(generate(ast)) === ast
 * i.e. the generator emits the *canonical* form, not the original source.
 */

import type {
	Block,
	Inline,
	List,
	Mark,
	MarkType,
	Quote,
	QuoteSource,
	Table,
	TableRow,
	TextRun,
	UcpDocument
} from './ast';

export function generate(doc: UcpDocument): string {
	return blocksToText(doc.content);
}

/** Sibling blocks are separated by a blank line so they re-parse as distinct. */
function blocksToText(blocks: Block[]): string {
	return blocks.map(blockToText).join('\n\n');
}

function blockToText(block: Block): string {
	switch (block.type) {
		case 'paragraph':
			return inlineToText(block.content);
		case 'heading':
			return '!' + inlineToText(block.content);
		case 'image':
			return `>>>IMAGE:${block.url}`;
		case 'codeBlock':
			return '```' + (block.lang ?? '') + '\n' + block.code + '\n```';
		case 'quote':
			return quoteToText(block);
		case 'mspoiler':
			return '<spoiler>\n' + blocksToText(block.content) + '\n</spoiler>';
		case 'list':
			return listToText(block, 0);
		case 'table':
			return tableToText(block);
	}
}

function quoteToText(quote: Quote): string {
	const header = quoteHeader(quote.source);
	return header + '\n' + blocksToText(quote.content) + '\n<<<QUOTE';
}

function quoteHeader(source: QuoteSource | null): string {
	if (source === null) {
		return '>>>QUOTE';
	}
	if (source.kind === 'user') {
		return `>>>QUOTE:@${source.id}`;
	}
	return `>>>QUOTE:${source.text}`;
}

function listToText(list: List, depth: number): string {
	const indent = '  '.repeat(depth);
	const lines: string[] = [];
	for (const item of list.items) {
		for (let i = 0; i < item.content.length; i++) {
			const child = item.content[i];
			if (i === 0 && child.type === 'paragraph') {
				lines.push(`${indent}- ${inlineToText(child.content)}`);
			} else if (child.type === 'list') {
				lines.push(listToText(child, depth + 1));
			} else {
				lines.push(`${indent}- ${blockToText(child)}`);
			}
		}
	}
	return lines.join('\n');
}

function tableToText(table: Table): string {
	const lines: string[] = [];
	if (table.header) {
		lines.push(rowToText(table.header));
		lines.push(
			'| ' +
				// alignment cells must be length >= 3 to be recognized on re-parse
				table.align
					.map((a) => (a === 'center' ? ':-:' : a === 'right' ? '--:' : ':--'))
					.join(' | ') +
				' |'
		);
	}
	for (const row of table.rows) {
		lines.push(rowToText(row));
	}
	return lines.join('\n');
}

function rowToText(row: TableRow): string {
	return '| ' + row.cells.map((c) => inlineToText(c.content)).join(' | ') + ' |';
}

// ---------------------------------------------------------------------------
// inline
// ---------------------------------------------------------------------------

function inlineToText(content: Inline[]): string {
	return content.map((node) => (node.type === 'hardBreak' ? '\n' : runToText(node))).join('');
}

// outer -> inner nesting order for deterministic, re-parseable output
const MARK_ORDER: MarkType[] = [
	'link',
	'color',
	'bold',
	'italic',
	'underline',
	'strike',
	'sub',
	'sup',
	'spoiler',
	'code'
];

function runToText(run: TextRun): string {
	const marks = [...run.marks].sort(
		(a, b) => MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type)
	);

	let open = '';
	let close = '';
	for (const mark of marks) {
		const tags = markTags(mark, run.text);
		if (tags === null) {
			continue; // bare autolink: no wrapping tag
		}
		open += tags[0];
		close = tags[1] + close;
	}
	return open + run.text + close;
}

/** Returns `[open, close]` tag strings, or `null` when the mark needs no tag. */
function markTags(mark: Mark, text: string): [string, string] | null {
	switch (mark.type) {
		case 'bold':
			return ['<b>', '</b>'];
		case 'italic':
			return ['<i>', '</i>'];
		case 'underline':
			return ['<u>', '</u>'];
		case 'strike':
			return ['<s>', '</s>'];
		case 'sub':
			return ['<sub>', '</sub>'];
		case 'sup':
			return ['<sup>', '</sup>'];
		case 'spoiler':
			return ['<spoiler>', '</spoiler>'];
		case 'code':
			return ['<code>', '</code>'];
		case 'color':
			return [`<${mark.color}>`, `</${mark.color}>`];
		case 'link':
			// autolinkable URL whose text is the href -> emit bare (re-detected on parse)
			if (/^https?:\/\//.test(text) && text === mark.href) {
				return null;
			}
			return ['<link>', '</link>'];
	}
}
