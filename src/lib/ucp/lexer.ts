import { COLOR_NAMES, type ColorName, type Features, type Mark, type QuoteSource } from './ast';

/**
 * Block-level tokens.
 */
export type Chunk =
	| { kind: 'blank' }
	| { kind: 'text'; text: string }
	| { kind: 'image'; url: string }
	| { kind: 'quoteOpen'; source: QuoteSource | null }
	| { kind: 'quoteClose' }
	| { kind: 'codeBlock'; lang: string | null; code: string }
	| { kind: 'header'; text: string }
	| { kind: 'tableRow'; cells: string[] }
	| { kind: 'listItem'; depth: number; text: string }
	| { kind: 'spoilerOpen' }
	| { kind: 'spoilerClose' };

const IMAGE_PREFIX = '>>>IMAGE:';
const QUOTE_PREFIX = '>>>QUOTE:';

/**
 * Tokenize a string into block-level chunks.
 */
export function tokenizeBlocks(text: string, features: Features): Chunk[] {
	const lines = preprocess(text, features);
	const chunks = scanChunks(lines, features);
	return features.spoilers ? normalizeSpoilerChunks(chunks) : chunks;
}

function preprocess(text: string, features: Features): string[] {
	let lines = text
		.trim()
		.split('\n')
		.map((l) => l.replace(/\s+$/, ''));

	if (!features.multiline) {
		lines = [lines.join(' ')];
	}

	if (features.sizeLimit !== null) {
		lines = trimToSize(lines, features.sizeLimit);
	}

	return lines;
}

function trimToSize(lines: string[], limit: number): string[] {
	const out: string[] = [];
	let used = 0;

	for (const line of lines) {
		const chars = [...line];

		if (used + chars.length <= limit) {
			out.push(line);
			used += chars.length + 1; // +1 for the newline
		} else {
			out.push(chars.slice(0, limit - used).join(''));
			return out;
		}
	}

	return out;
}

function scanChunks(lines: string[], features: Features): Chunk[] {
	const chunks: Chunk[] = [];
	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i].replace(/\t/g, '    ');
		const ltrim = raw.replace(/^ +/, '');

		if (ltrim === '') {
			chunks.push({ kind: 'blank' });
			continue;
		}

		// 2. image
		if (features.images && ltrim.startsWith(IMAGE_PREFIX)) {
			const url = normalizeImageUrl(ltrim.slice(IMAGE_PREFIX.length).trim());

			if (url !== null) {
				chunks.push({ kind: 'image', url });
				continue;
			}
		}

		// 3/4. quotes
		if (features.quotes) {
			if (ltrim === '>>>QUOTE' || ltrim.startsWith(QUOTE_PREFIX)) {
				let source: QuoteSource | null = null;

				if (ltrim.startsWith(QUOTE_PREFIX)) {
					source = encodeQuoteSource(ltrim.slice(QUOTE_PREFIX.length).trim());
				}

				chunks.push({ kind: 'quoteOpen', source });
				continue;
			}

			if (ltrim === '<<<QUOTE') {
				chunks.push({ kind: 'quoteClose' });
				continue;
			}
		}

		// 5. code fence (matches raw line)
		const fence = matchCodeFence(raw);

		if (fence) {
			const { ticks, lang } = fence;
			const codeLines: string[] = [];
			let closed = false;

			let j = i + 1;
			for (; j < lines.length; j++) {
				if (lines[j] === ticks) {
					closed = true;
					break;
				}

				codeLines.push(lines[j]);
			}

			const code = codeLines.join('\n').replace(/\s+$/, '');
			chunks.push({ kind: 'codeBlock', lang, code });

			i = closed ? j : lines.length;

			continue;
		}

		// 6. header (matches raw line)
		if (features.headers && raw.startsWith('!') && raw.length > 1) {
			chunks.push({ kind: 'header', text: raw.slice(1) });
			continue;
		}

		// 7. table row (matches raw line)
		if (features.tables && raw.startsWith('|') && raw.endsWith('|')) {
			const cells = splitTableRow(raw);
			if (cells && cells.length >= 2) {
				chunks.push({ kind: 'tableRow', cells });
				continue;
			}
		}

		// 8. list item
		if (ltrim.startsWith('- ')) {
			chunks.push({
				kind: 'listItem',
				depth: raw.length - ltrim.length,
				text: ltrim.slice(2).trim()
			});
			continue;
		}

		// 9. text
		chunks.push({ kind: 'text', text: ltrim });
	}
	return chunks;
}

function normalizeImageUrl(url: string): string | null {
	const parts = url.split('://');
	if (parts.length !== 2) {
		return null;
	}

	if (parts[0] === 'http') {
		parts[0] = 'https';
	}

	return parts.join('://');
}

function encodeQuoteSource(source: string): QuoteSource {
	if (source.startsWith('@') && source.length > 1) {
		const id = alphaNumsOnly(source);
		if (id !== '' && id.length <= 30) {
			return { kind: 'user', id: source.slice(1) };
		}
	}

	return { kind: 'text', text: source };
}

function matchCodeFence(raw: string): { ticks: string; lang: string | null } | null {
	const m = raw.match(/^(`{3,})(.*)$/);

	if (!m) {
		return null;
	}

	const lang = m[2];

	if (!/^[a-zA-Z0-9]*$/.test(lang)) {
		return null;
	}

	return { ticks: m[1], lang: lang === '' ? null : lang };
}

function splitTableRow(raw: string): string[] | null {
	const inner = raw.slice(1, -1);
	const cells = inner.split('|');

	for (const cell of cells) {
		if (cell.endsWith('\\') || cell.includes('`')) {
			return null; // "finicky" bail -> not a table
		}
	}

	return cells.map((c) => c.trim());
}

/**
 * Replace standalone `<spoiler>` / `</spoiler>` text chunks with block-level
 * `spoilerOpen` / `spoilerClose` chunks so the parser treats them as blocks.
 * Inline `<spoiler>...</spoiler>` within surrounding text stays inline.
 */
function normalizeSpoilerChunks(chunks: Chunk[]): Chunk[] {
	const out: Chunk[] = [];
	for (const chunk of chunks) {
		if (chunk.kind === 'text' && (chunk.text === '<spoiler>' || chunk.text === '</spoiler>')) {
			out.push({ kind: chunk.text === '<spoiler>' ? 'spoilerOpen' : 'spoilerClose' });
		} else {
			out.push(chunk);
		}
	}
	return out;
}

export type TagKey = string; // 'bold' | 'italic' | ... | 'link' | `color:${name}`

export interface TagInfo {
	key: TagKey;
	name: string; // literal tag name, for reconstructing orphan closers
	mark: Mark | null; // null for link (handled specially by the parser)
	link: boolean;
}

/**
 * Inline-level tokens.
 */
export type Tok =
	| { t: 'text'; s: string }
	| { t: 'code'; s: string }
	| { t: 'url'; s: string }
	| { t: 'open'; tag: TagInfo }
	| { t: 'close'; tag: TagInfo };

const COLOR_SET = new Set<string>(COLOR_NAMES);

function tagInfo(name: string, features: Features): TagInfo | null {
	switch (name) {
		case 'b':
			return { key: 'bold', name, mark: { type: 'bold' }, link: false };
		case 'i':
			return { key: 'italic', name, mark: { type: 'italic' }, link: false };
		case 'u':
			return { key: 'underline', name, mark: { type: 'underline' }, link: false };
		case 's':
			return { key: 'strike', name, mark: { type: 'strike' }, link: false };
		case 'sub':
			return { key: 'sub', name, mark: { type: 'sub' }, link: false };
		case 'sup':
			return { key: 'sup', name, mark: { type: 'sup' }, link: false };
		case 'spoiler':
			return features.spoilers
				? { key: 'spoiler', name, mark: { type: 'spoiler' }, link: false }
				: null;
		case 'link':
			return features.linkTag ? { key: 'link', name, mark: null, link: true } : null;
	}

	if (COLOR_SET.has(name)) {
		return {
			key: `color:${name}`,
			name,
			mark: { type: 'color', color: name as ColorName },
			link: false
		};
	}

	return null;
}

export function lexInline(line: string, features: Features): Tok[] {
	const toks: Tok[] = [];
	let buf = '';
	const flush = () => {
		if (buf !== '') {
			toks.push({ t: 'text', s: buf });
			buf = '';
		}
	};

	let i = 0;
	while (i < line.length) {
		// inline code island
		if (line.startsWith('<code>', i)) {
			flush();
			const end = line.indexOf('</code>', i + 6);
			if (end === -1) {
				toks.push({ t: 'code', s: line.slice(i + 6) });
				i = line.length;
			} else {
				toks.push({ t: 'code', s: line.slice(i + 6, end) });
				i = end + 7;
			}
			continue;
		}

		// tag open/close
		if (line[i] === '<') {
			const m = /^<(\/?)([a-z]+)>/.exec(line.slice(i));
			if (m) {
				const info = tagInfo(m[2], features);
				if (info) {
					flush();
					toks.push({ t: m[1] === '/' ? 'close' : 'open', tag: info });
					i += m[0].length;
					continue;
				}
			}
		}

		// autolink
		if (features.autolink && (line.startsWith('http://', i) || line.startsWith('https://', i))) {
			const len = urlLength(line, i);
			if (len > 0) {
				flush();
				toks.push({ t: 'url', s: line.slice(i, i + len) });
				i += len;
				continue;
			}
		}

		buf += line[i];
		i++;
	}
	flush();
	return toks;
}

const URL_CHARS = new Set(
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/%@#~^:*+$',&?=_-.[]()0123456789".split('')
);

/**
 * Returns the length of a URL starting at `start` in `chars`, or 0 if there
 * is no valid URL.
 */
function urlLength(chars: string, start: number): number {
	const rest = chars.slice(start);

	if (!/^https?:\/\//.test(rest)) {
		return 0;
	}

	const stack: string[] = [];
	let i = start + rest.indexOf('://') + 3;

	// scan until we hit a character that is not allowed in a URL, or until we hit
	// a closing bracket that doesn't match an opening bracket
	for (; i < chars.length; i++) {
		const c = chars[i];

		if (!URL_CHARS.has(c)) {
			break;
		}

		if (c === '[' || c === '(') {
			stack.push(c);
		} else if (c === ')') {
			if (stack[stack.length - 1] !== '(') {
				break;
			}

			stack.pop();
		} else if (c === ']') {
			if (stack[stack.length - 1] !== '[') {
				break;
			}

			stack.pop();
		}
	}
	return i - start;
}

function alphaNumsOnly(val: string): string {
	return val.replace(/[^a-zA-Z0-9]/g, '');
}
