/**
 * UCP abstract syntax tree.
 */

export type UcpContext = 'FORUM' | 'PROFILE' | 'CHAT' | 'QA_QUESTION' | 'QA_ANSWER' | 'QA_POLL';

/**
 * UCP feature set. These are used to configure the parser and renderer.
 */
export interface Features {
	multiline: boolean;
	quotes: boolean;
	spoilers: boolean;
	headers: boolean;
	tables: boolean;
	autolink: boolean;
	linkTag: boolean;
	images: boolean;
	sizeLimit: number | null;
}

/**
 * UCP feature sets by context. These are used to configure the parser and renderer.
 */
export const FEATURES: Record<UcpContext, Features> = {
	FORUM: {
		multiline: true,
		quotes: true,
		spoilers: true,
		headers: true,
		tables: true,
		autolink: true,
		linkTag: true,
		images: true,
		sizeLimit: null
	},
	PROFILE: {
		multiline: true,
		quotes: false,
		spoilers: true,
		headers: true,
		tables: true,
		autolink: true,
		linkTag: true,
		images: true,
		sizeLimit: null
	},
	CHAT: {
		multiline: true,
		quotes: false,
		spoilers: true,
		headers: false,
		tables: true,
		autolink: true,
		linkTag: false,
		images: false,
		sizeLimit: null
	},
	QA_QUESTION: {
		multiline: true,
		quotes: false,
		spoilers: true,
		headers: false,
		tables: true,
		autolink: true,
		linkTag: false,
		images: false,
		sizeLimit: null
	},
	QA_ANSWER: {
		multiline: true,
		quotes: false,
		spoilers: true,
		headers: false,
		tables: true,
		autolink: true,
		linkTag: false,
		images: false,
		sizeLimit: null
	},
	QA_POLL: {
		multiline: false,
		quotes: false,
		spoilers: false,
		headers: false,
		tables: false,
		autolink: true,
		linkTag: false,
		images: false,
		sizeLimit: 200
	}
};

export const COLOR_NAMES = [
	'red',
	'orange',
	'yellow',
	'green',
	'blue',
	'purple',
	'pink',
	'brown',
	'gray',
	'mauve',
	'aqua',
	'maroon',
	'cyan',
	'lime'
] as const;

export type ColorName = (typeof COLOR_NAMES)[number];

export type Mark =
	| { type: 'bold' }
	| { type: 'italic' }
	| { type: 'underline' }
	| { type: 'strike' }
	| { type: 'sub' }
	| { type: 'sup' }
	| { type: 'code' }
	| { type: 'spoiler' }
	| { type: 'color'; color: ColorName }
	| { type: 'link'; href: string };

export type MarkType = Mark['type'];

/** A contiguous run of text carrying a set of marks. */
export interface TextRun {
	type: 'text';
	text: string;
	marks: Mark[];
}

/** An explicit line break within a block (e.g. inside a multi-line quote). */
export interface HardBreak {
	type: 'hardBreak';
}

export type Inline = TextRun | HardBreak;

// ---------------------------------------------------------------------------
// Block nodes
// ---------------------------------------------------------------------------

export interface Paragraph {
	type: 'paragraph';
	content: Inline[];
}

export interface Heading {
	type: 'heading';
	content: Inline[];
}

/**
 * Quote source. `user` is a `@handle` reference; `text` is a free-form label.
 * `null` (on the Quote node) means an anonymous quote.
 */
export type QuoteSource = { kind: 'user'; id: string } | { kind: 'text'; text: string };

export interface Quote {
	type: 'quote';
	source: QuoteSource | null;
	content: Block[];
}

export interface CodeBlock {
	type: 'codeBlock';
	/** Language name, or `null` when the fence had none. */
	lang: string | null;
	code: string;
}

export interface ListItem {
	type: 'listItem';
	content: Block[];
}

export interface List {
	type: 'list';
	items: ListItem[];
}

export type CellAlign = 'left' | 'center' | 'right';

export interface TableCell {
	type: 'tableCell';
	content: Inline[];
}

export interface TableRow {
	type: 'tableRow';
	cells: TableCell[];
}

export interface Table {
	type: 'table';
	header: TableRow | null;
	rows: TableRow[];
	align: CellAlign[];
}

export interface Image {
	type: 'image';
	url: string;
}

export interface MultiLineSpoiler {
	type: 'mspoiler';
	content: Block[];
}

export type Block =
	Paragraph | Heading | Quote | CodeBlock | List | Table | Image | MultiLineSpoiler;

export type BlockType = Block['type'];

export interface UcpDocument {
	type: 'doc';
	content: Block[];
}

/**
 * Whether two marks are equal.
 */
export function marksEqual(a: Mark, b: Mark): boolean {
	if (a.type !== b.type) {
		return false;
	}

	if (a.type === 'color' && b.type === 'color') {
		return a.color === b.color;
	}

	if (a.type === 'link' && b.type === 'link') {
		return a.href === b.href;
	}

	return true;
}

/**
 * Whether a mark set contains a mark.
 */
export function hasMark(marks: Mark[], mark: Mark): boolean {
	return marks.some((m) => marksEqual(m, mark));
}

/**
 * Whether two mark sets are equal.
 */
export function markSetsEqual(a: Mark[], b: Mark[]): boolean {
	if (a.length !== b.length) {
		return false;
	}

	return a.every((m) => hasMark(b, m));
}
