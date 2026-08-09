import type { Mark as PMMark, Node as PMNode } from 'prosemirror-model';
import type { Block, Inline, Mark, UcpDocument } from '../ast';

/**
 * Converts ProseMirror document to UCP AST.
 *
 * Note that empty paragraphs are dropped since TwoCans UCP does not have a
 * blank paragraph (a blank line is a block *separator*), so there is nothing
 * to serialize them to, and the rendered output would not show them either.
 */
export function fromPM(doc: PMNode): UcpDocument {
	const content: Block[] = [];

	doc.forEach((node) => {
		const block = blockFromPM(node);

		if (block !== null) {
			content.push(block);
		}
	});

	return { type: 'doc', content };
}

function blockFromPM(node: PMNode): Block | null {
	if (node.type.name !== 'paragraph') {
		throw new Error(`fromPM: unexpected node type '${node.type.name}'`);
	}

	if (node.content.size === 0) {
		return null;
	}

	const content: Inline[] = [];
	node.forEach((child) => {
		content.push(inlineFromPM(child));
	});

	return { type: 'paragraph', content };
}

function inlineFromPM(node: PMNode): Inline {
	return {
		type: 'text',
		text: node.text ?? '',
		marks: node.marks.map(markFromPM)
	};
}

function markFromPM(mark: PMMark): Mark {
	const name = mark.type.name as Mark['type'];

	switch (name) {
		case 'bold':
		case 'italic':
		case 'underline':
		case 'strike':
		case 'spoiler':
		case 'code':
			return { type: name };
		default:
			throw new Error(`fromPM: unexpected mark type '${mark.type.name}'`);
	}
}
