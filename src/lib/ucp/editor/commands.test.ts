import { describe, it, expect } from 'vitest';
import { EditorState, TextSelection } from 'prosemirror-state';
import { schema } from './schema';
import { isMarkActive, markCommand, ucpPlugins } from './commands';

function state(text: string) {
	return EditorState.create({
		schema,
		plugins: ucpPlugins(schema),
		doc: schema.nodeFromJSON({
			type: 'doc',
			content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
		})
	});
}

function select(state: EditorState, from: number, to = from) {
	const tr = state.tr.setSelection(TextSelection.create(state.doc, from, to));

	return state.apply(tr);
}

describe('isMarkActive', () => {
	it('is false for a cursor in plain text', () => {
		const s = select(state('hello'), 3);

		expect(isMarkActive(s, schema, 'bold')).toBe(false);
	});

	it('is true for a cursor inside a marked run', () => {
		const s = state('hello');
		const marked = s.apply(s.tr.addMark(1, 3, schema.marks.bold.create()));
		const cursor = select(marked, 2);

		expect(isMarkActive(cursor, schema, 'bold')).toBe(true);
		expect(isMarkActive(cursor, schema, 'italic')).toBe(false);
	});

	it('is true when the selection covers a marked range', () => {
		const s = state('hello');
		const marked = s.apply(s.tr.addMark(1, 3, schema.marks.bold.create()));
		const sel = select(marked, 1, 5);

		expect(isMarkActive(sel, schema, 'bold')).toBe(true);
	});

	it('reads stored marks for an empty selection', () => {
		const s = select(state('hello'), 1);
		const stored = s.apply(s.tr.setStoredMarks([schema.marks.bold.create()]));

		expect(isMarkActive(stored, schema, 'bold')).toBe(true);
	});
});

describe('markCommand', () => {
	it('toggles a mark onto a selection', () => {
		const s = select(state('hello'), 1, 5);
		let dispatched = s.tr;

		markCommand(schema, 'bold')!(s, (tr) => (dispatched = tr), undefined);

		const toggled = s.apply(dispatched);

		expect(toggled.doc.rangeHasMark(1, 5, schema.marks.bold)).toBe(true);
	});

	it('toggles a mark off a selection', () => {
		const s = select(state('hello'), 1, 5);
		let dispatched = s.tr;

		markCommand(schema, 'bold')!(s, (tr) => (dispatched = tr), undefined);
		const on = s.apply(dispatched);
		let offTr = on.tr;

		markCommand(schema, 'bold')!(on, (tr) => (offTr = tr), undefined);
		const off = on.apply(offTr);

		expect(off.doc.rangeHasMark(1, 5, schema.marks.bold)).toBe(false);
	});

	it('returns null for a mark the schema lacks', () => {
		expect(markCommand(schema, 'nope')).toBeNull();
	});
});
