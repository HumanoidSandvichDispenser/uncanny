import {
	FEATURES,
	hasMark,
	markSetsEqual,
	type Block,
	type CellAlign,
	type Features,
	type Inline,
	type List,
	type ListItem,
	type Mark,
	type Table,
	type TableRow,
	type TextRun,
	type UcpContext,
	type UcpDocument
} from './ast';
import { lexInline, tokenizeBlocks, type Chunk, type TagInfo, type TagKey, type Tok } from './lexer';

export function parse(text: string, context: UcpContext = 'FORUM'): UcpDocument {
	const features = FEATURES[context];
	const chunks = tokenizeBlocks(text ?? '', features);
	const content = buildBlocks(chunks, { i: 0 }, features, null);
	return { type: 'doc', content };
}

interface Cursor {
	i: number;
}

type StopKind = 'quoteClose' | 'spoilerClose' | null;

function buildBlocks(chunks: Chunk[], cur: Cursor, features: Features, stop: StopKind): Block[] {
	const blocks: Block[] = [];
	let para: Inline[] | null = null;

	const flushPara = () => {
		if (para !== null) {
			blocks.push({ type: 'paragraph', content: para });
			para = null;
		}
	};

	// append a text line to the running paragraph (with a hard break if continuing)
	const appendLine = (text: string) => {
		if (para === null) {
			para = parseInline(text, features);
		} else {
			para.push({ type: 'hardBreak' }, ...parseInline(text, features));
		}
	};

	while (cur.i < chunks.length) {
		const chunk = chunks[cur.i];

		if (
			(stop === 'quoteClose' && chunk.kind === 'quoteClose') ||
			(stop === 'spoilerClose' && chunk.kind === 'spoilerClose')
		) {
			cur.i++; // consume the closer
			flushPara();
			return blocks;
		}

		switch (chunk.kind) {
			case 'blank':
				flushPara();
				cur.i++;
				break;

			case 'text':
				appendLine(chunk.text);
				cur.i++;
				break;

			case 'header':
				flushPara();
				blocks.push({ type: 'heading', content: parseInline(chunk.text, features) });
				cur.i++;
				break;

			case 'image':
				flushPara();
				blocks.push({ type: 'image', url: chunk.url });
				cur.i++;
				break;

			case 'listItem':
				flushPara();
				blocks.push(parseList(chunks, cur, features));
				break;

			case 'tableRow':
				flushPara();
				blocks.push(parseTable(chunks, cur, features));
				break;

			case 'quoteOpen': {
				flushPara();
				const source = chunk.source;
				cur.i++;
				const content = buildBlocks(chunks, cur, features, 'quoteClose');
				blocks.push({ type: 'quote', source, content });
				break;
			}

			case 'spoilerOpen': {
				flushPara();
				cur.i++;
				const content = buildBlocks(chunks, cur, features, 'spoilerClose');
				blocks.push({ type: 'mspoiler', content });
				break;
			}

			// orphan closers with no matching opener -> literal text
			case 'quoteClose':
				appendLine('<<<QUOTE');
				cur.i++;
				break;

			case 'spoilerClose':
				appendLine('</spoiler>');
				cur.i++;
				break;

			case 'codeBlock':
				flushPara();
				blocks.push({ type: 'codeBlock', lang: chunk.lang, code: chunk.code });
				cur.i++;
				break;
		}
	}

	flushPara();
	return blocks;
}

function parseList(chunks: Chunk[], cur: Cursor, features: Features): List {
	const first = chunks[cur.i] as Extract<Chunk, { kind: 'listItem' }>;
	const baseDepth = first.depth;
	const items: ListItem[] = [];

	while (cur.i < chunks.length) {
		const chunk = chunks[cur.i];
		if (chunk.kind !== 'listItem' || chunk.depth < baseDepth) {
			break;
		}
		if (chunk.depth > baseDepth) {
			// deeper run nests under the previous item
			const nested = parseList(chunks, cur, features);
			if (items.length > 0) {
				items[items.length - 1].content.push(nested);
			} else {
				items.push({ type: 'listItem', content: [nested] });
			}
			continue;
		}
		items.push({
			type: 'listItem',
			content: [{ type: 'paragraph', content: parseInline(chunk.text, features) }]
		});
		cur.i++;
	}

	return { type: 'list', items };
}

function parseTable(chunks: Chunk[], cur: Cursor, features: Features): Table {
	const rows: string[][] = [];

	while (cur.i < chunks.length && chunks[cur.i].kind === 'tableRow') {
		rows.push((chunks[cur.i] as Extract<Chunk, { kind: 'tableRow' }>).cells);
		cur.i++;
	}

	const maxWidth = rows.reduce((m, r) => Math.max(m, r.length), 0);
	let align: CellAlign[] | null = null;

	if (rows.length >= 2) {
		const candidate = rows[1].map(cellAlignment);
		if (!candidate.includes(null)) {
			align = candidate as CellAlign[];
		}
	}

	const toRow = (cells: string[]): TableRow => ({
		type: 'tableRow',
		cells: cells.map((c) => ({ type: 'tableCell' as const, content: parseInline(c, features) }))
	});

	if (align) {
		while (align.length < maxWidth) {
			align.push('left');
		}
		return {
			type: 'table',
			header: toRow(rows[0]),
			rows: rows.slice(2).map(toRow),
			align
		};
	}

	return {
		type: 'table',
		header: null,
		rows: rows.map(toRow),
		align: new Array(maxWidth).fill('left')
	};
}

/** `:-:`→center, `--:`→right, `:--`/`---`→left, else null (not an alignment cell). */
function cellAlignment(cell: string): CellAlign | null {
	if (cell.length < 3) {
		return null;
	}
	const pre = cell.startsWith(':');
	const post = cell.endsWith(':');
	const start = pre ? 1 : 0;
	const end = post ? cell.length - 1 : cell.length;
	for (let i = start; i < end; i++) {
		if (cell[i] !== '-') {
			return null;
		}
	}
	if (pre && post) {
		return 'center';
	}
	if (post) {
		return 'right';
	}
	return 'left';
}

// ---------------------------------------------------------------------------
// Inline assembly (tokens -> runs)
// ---------------------------------------------------------------------------

type Node =
	| { t: 'text'; s: string }
	| { t: 'code'; s: string }
	| { t: 'url'; s: string }
	| { t: 'tag'; tag: TagInfo; children: Node[] };

export function parseInline(line: string, features: Features): Inline[] {
	const toks = lexInline(line, features);
	const nodes = parseNodes(toks, { i: 0 }, []);
	const runs: TextRun[] = [];
	flatten(nodes, [], runs);
	return runs;
}

function parseNodes(toks: Tok[], cur: Cursor, active: TagKey[]): Node[] {
	const nodes: Node[] = [];
	while (cur.i < toks.length) {
		const tok = toks[cur.i];
		switch (tok.t) {
			case 'text':
				nodes.push({ t: 'text', s: tok.s });
				cur.i++;
				break;
			case 'code':
				nodes.push({ t: 'code', s: tok.s });
				cur.i++;
				break;
			case 'url':
				nodes.push({ t: 'url', s: tok.s });
				cur.i++;
				break;
			case 'open': {
				const key = tok.tag.key;
				cur.i++;
				const children = parseNodes(toks, cur, [...active, key]);
				consumeClose(toks, cur, key);
				if (shouldDrop(tok.tag, active)) {
					// redundant/over-limit: drop the tag, promote its children
					nodes.push(...children);
				} else {
					nodes.push({ t: 'tag', tag: tok.tag, children });
				}
				break;
			}
			case 'close': {
				// A closer matches only the *innermost* open tag; otherwise it is
				// literal text (matches the blob's stack-pairing behavior).
				if (tok.tag.key === active[active.length - 1]) {
					return nodes; // the opener consumes it
				}
				nodes.push({ t: 'text', s: `</${tok.tag.name}>` });
				cur.i++;
				break;
			}
		}
	}
	return nodes;
}

function consumeClose(toks: Tok[], cur: Cursor, key: TagKey): void {
	const tok = toks[cur.i];
	if (tok && tok.t === 'close' && tok.tag.key === key) {
		cur.i++;
	}
	// otherwise the tag auto-closes (unclosed) or the pending close belongs to an ancestor
}

function shouldDrop(tag: TagInfo, active: TagKey[]): boolean {
	// redundant same tag / same color / nested link
	if (active.includes(tag.key)) {
		return true;
	}

	// combined sub/sup depth > 5
	if (tag.key === 'sub' || tag.key === 'sup') {
		const depth = active.filter((k) => k === 'sub' || k === 'sup').length;
		if (depth > 5) {
			return true;
		}
	}

	return false;
}

function flatten(nodes: Node[], marks: Mark[], out: TextRun[]): void {
	for (const node of nodes) {
		switch (node.t) {
			case 'text':
				pushRun(out, node.s, marks);
				break;

			case 'code':
				pushRun(out, node.s, addMark(marks, { type: 'code' }));
				break;

			case 'url':
				pushRun(out, node.s, addMark(marks, { type: 'link', href: node.s }));
				break;

			case 'tag':
				if (node.tag.link) {
					const href = linkHref(node.children);

					const next = marks.some((m) => m.type === 'link')
						? marks
						: addMark(marks, { type: 'link', href });

					flatten(node.children, next, out);
				} else if (node.tag.mark) {
					flatten(node.children, addMark(marks, node.tag.mark), out);
				} else {
					flatten(node.children, marks, out);
				}

				break;
		}
	}
}

function linkHref(children: Node[]): string {
	const url = findUrl(children);

	if (url !== null) {
		return url;
	}

	return plainText(children).trim();
}

function findUrl(nodes: Node[]): string | null {
	for (const node of nodes) {
		if (node.t === 'url') {
			return node.s;
		}

		if (node.t === 'tag') {
			const found = findUrl(node.children);

			if (found !== null) {
				return found;
			}
		}
	}

	return null;
}

function plainText(nodes: Node[]): string {
	let out = '';

	for (const node of nodes) {
		if (node.t === 'text' || node.t === 'code' || node.t === 'url') {
			out += node.s;
		} else {
			out += plainText(node.children);
		}
	}

	return out;
}

function addMark(marks: Mark[], mark: Mark): Mark[] {
	if (hasMark(marks, mark)) {
		return marks;
	}

	return [...marks, mark];
}

function pushRun(out: TextRun[], text: string, marks: Mark[]): void {
	if (text === '') {
		return;
	}

	const last = out[out.length - 1];
	if (last && markSetsEqual(last.marks, marks)) {
		last.text += text;
		return;
	}

	out.push({ type: 'text', text, marks: [...marks] });
}
