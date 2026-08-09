import { Schema } from 'prosemirror-model';

/**
 * Editor schema: the subset of UCP the editor can author.
 *
 * Marks are declared in MARK_ORDER (generate.ts) relative order because
 * ProseMirror normalizes mark sets to schema declaration order — matching
 * the two keeps generate(fromPM(doc)) canonical.
 */
export const schema = new Schema({
	nodes: {
		doc: { content: 'block+' },
		paragraph: {
			content: 'text*',
			group: 'block',
			toDOM: () => ['p', 0],
			parseDOM: [{ tag: 'p' }]
		},
		text: {}
	},
	marks: {
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
			// no parseDOM: no HTML equivalent
			toDOM: () => ['span', { class: 'spoiler' }, 0]
		},
		code: {
			toDOM: () => ['code', { class: 'code' }, 0],
			parseDOM: [{ tag: 'code' }]
		}
	}
});
