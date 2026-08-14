import type { Mark as PMMark, Node as PMNode } from 'prosemirror-model';
import type { Block, Inline, ListItem, Mark, UcpDocument } from '../ast';

/**
 * Converts ProseMirror document to UCP AST.
 *
 * Empty text blocks are dropped: TwoCans UCP has no representation for a
 * blank paragraph or heading (a blank line is a block *separator*), and an
 * empty list item cannot be parsed back either, so there is nothing to
 * serialize them to, and the rendered output would not show them.
 *
 * A block can also expand to several: a line break inside a list item is not
 * expressible in UCP (`- x\ny` parses as an item followed by a paragraph), so
 * the item keeps its first paragraph and the rest spills out after the list.
 */
export function fromPM(doc: PMNode): UcpDocument {
	const content: Block[] = [];

	doc.forEach((node) => {
		content.push(...blocksFromPM(node));
	});

	return { type: 'doc', content };
}

function blocksFromPM(node: PMNode): Block[] {
	switch (node.type.name) {
		case 'paragraph':
		case 'heading': {
			const block = textBlockFromPM(node, node.type.name);

			return block === null ? [] : [block];
		}
		case 'list':
			return listFromPM(node);
		default:
			throw new Error(`fromPM: unexpected node type '${node.type.name}'`);
	}
}

function textBlockFromPM(node: PMNode, type: 'paragraph' | 'heading'): Block | null {
	if (node.content.size === 0) {
		return null;
	}

	const content: Inline[] = [];
	node.forEach((child) => {
		content.push(inlineFromPM(child));
	});

	return type === 'paragraph' ? { type: 'paragraph', content } : { type: 'heading', content };
}

function listFromPM(node: PMNode): Block[] {
	const items: ListItem[] = [];
	const spill: Block[] = [];

	node.forEach((itemNode) => {
		if (itemNode.type.name !== 'listItem') {
			throw new Error(`fromPM: unexpected node type '${itemNode.type.name}' inside list`);
		}

		const content: Block[] = [];
		itemNode.forEach((child) => {
			content.push(...blocksFromPM(child));
		});

		const split = splitHardBreak(content);

		if (split.item.length > 0) {
			items.push({ type: 'listItem', content: split.item });
		}

		spill.push(...split.rest);
	});

	const blocks: Block[] = [];

	if (items.length > 0) {
		blocks.push({ type: 'list', items });
	}

	blocks.push(...spill);

	return blocks;
}

function splitHardBreak(content: Block[]): { item: Block[]; rest: Block[] } {
	for (let i = 0; i < content.length; i++) {
		const block = content[i];

		if (block.type !== 'paragraph') {
			continue;
		}

		const idx = block.content.findIndex((inline) => inline.type === 'hardBreak');

		if (idx === -1) {
			continue;
		}

		const before = block.content.slice(0, idx);
		const after = block.content.slice(idx + 1);

		return {
			item: [...content.slice(0, i), ...(before.length > 0 ? [{ ...block, content: before }] : [])],
			rest: [...(after.length > 0 ? [{ ...block, content: after }] : []), ...content.slice(i + 1)]
		};
	}

	return { item: content, rest: [] };
}

function inlineFromPM(node: PMNode): Inline {
	switch (node.type.name) {
		case 'text':
			return {
				type: 'text',
				text: node.text ?? '',
				marks: node.marks.map(markFromPM)
			};
		case 'hardBreak':
			return { type: 'hardBreak' };
		default:
			throw new Error(`fromPM: unexpected inline node type '${node.type.name}'`);
	}
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
