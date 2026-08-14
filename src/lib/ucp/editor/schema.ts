import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { FEATURES, type UcpContext } from '../ast';

const nodeSpecs: Record<string, NodeSpec> = {
	doc: {
		content: 'block+',
	},
	paragraph: {
		content: 'inline*',
		group: 'block',
		toDOM: () => ['p', 0],
		parseDOM: [{ tag: 'p' }]
	},
	text: {
		group: 'inline'
	},
	heading: {
		content: 'inline*',
		group: 'block',
		toDOM: () => ['h3', { class: 'heading' }, 0],
		parseDOM: [{ tag: 'h3' }]
	},
	list: {
		content: 'listItem+',
		group: 'block',
		toDOM: () => ['ul', 0],
		parseDOM: [{ tag: 'ul' }]
	},
	listItem: {
		content: 'block+',
		toDOM: () => ['li', 0],
		parseDOM: [{ tag: 'li' }]
	},
	hardBreak: {
		inline: true,
		group: 'inline',
		toDOM: () => ['br'],
		parseDOM: [{ tag: 'br' }]
	}
};

const markSpecs: Record<string, MarkSpec> = {
	bold: {
		toDOM: () => ['strong', 0],
		parseDOM: [{ tag: 'strong' }, { tag: 'b' }]
	},
	italic: {
		toDOM: () => ['em', 0],
		parseDOM: [{ tag: 'em' }, { tag: 'i' }]
	},
	underline: {
		toDOM: () => ['u', 0],
		parseDOM: [{ tag: 'u' }]
	},
	strike: {
		toDOM: () => ['s', 0],
		parseDOM: [{ tag: 's' }, { tag: 'del' }]
	},
	spoiler: {
		toDOM: () => ['span', { class: 'spoiler' }, 0]
	},
	code: {
		toDOM: () => ['code', { class: 'code' }, 0],
		parseDOM: [{ tag: 'code' }]
	}
};

export function schemaFor(context: UcpContext): Schema {
	const featureSet = FEATURES[context];

	const nodes: Record<string, NodeSpec> = {
		doc: nodeSpecs.doc,
		paragraph: nodeSpecs.paragraph,
		text: nodeSpecs.text,
		list: nodeSpecs.list,
		listItem: nodeSpecs.listItem
	};

	if (featureSet.headers) {
		nodes.heading = nodeSpecs.heading;
	}

	if (featureSet.multiline) {
		nodes.hardBreak = nodeSpecs.hardBreak;
	}

	const marks: Record<string, MarkSpec> = {
		bold: markSpecs.bold,
		italic: markSpecs.italic,
		underline: markSpecs.underline,
		strike: markSpecs.strike,
		code: markSpecs.code
	};

	if (featureSet.headers) {
		nodes.heading = nodeSpecs.heading;
	}

	if (featureSet.spoilers) {
		marks.spoiler = markSpecs.spoiler;
	}

	return new Schema({
		nodes,
		marks
	});
}
