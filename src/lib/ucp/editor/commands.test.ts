import { describe, it, expect } from 'vitest';
import { EditorState, TextSelection } from 'prosemirror-state';
import { schemaFor } from './schema';
import { isBlockActive, isMarkActive, markCommand, blockCommand, ucpPlugins } from './commands';

const schema = schemaFor('FORUM');

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

const para = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const heading = (text: string) => ({ type: 'heading', content: [{ type: 'text', text }] });
const listItem = (...blocks: object[]) => ({ type: 'listItem', content: blocks });
const list = (...items: object[]) => ({ type: 'list', content: items });

function blockState(content: object[]) {
	return EditorState.create({
		schema,
		plugins: ucpPlugins(schema),
		doc: schema.nodeFromJSON({ type: 'doc', content })
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

	describe('isBlockActive', () => {
	it('is false at top level and true inside a heading', () => {
		const s = select(blockState([heading('title')]), 3);

		expect(isBlockActive(s, 'heading')).toBe(true);
		expect(isBlockActive(s, 'paragraph')).toBe(false);
	});

	it('is true at nested list depth', () => {
		const s = select(blockState([list(listItem(para('a'), list(listItem(para('b')))))]), 4);

		expect(isBlockActive(s, 'list')).toBe(true);
		expect(isBlockActive(s, 'listItem')).toBe(true);
	});
});

describe('blockCommand', () => {
	it('toggles a paragraph to a heading and back', () => {
		const s = select(state('hello'), 1, 5);
		let tr = s.tr;

		blockCommand(schema, 'heading')!(s, (t) => (tr = t), undefined);
		const headingState = s.apply(tr);

		expect(headingState.doc.child(0).type.name).toBe('heading');

		let tr2 = headingState.tr;
		blockCommand(schema, 'heading')!(headingState, (t) => (tr2 = t), undefined);
		const back = headingState.apply(tr2);

		expect(back.doc.child(0).type.name).toBe('paragraph');
	});

	it('refuses a heading inside a list item', () => {
		const s = select(blockState([list(listItem(para('a')))]), 2);
		let dispatched = false;

		const ok = blockCommand(schema, 'heading')!(s, () => (dispatched = true), undefined);

		expect(ok).toBe(false);
		expect(dispatched).toBe(false);
	});

	it('wraps a paragraph selection in a list', () => {
		const s = select(state('hello'), 1, 5);
		let tr = s.tr;

		blockCommand(schema, 'list')!(s, (t) => (tr = t), undefined);
		const out = s.apply(tr);

		expect(out.doc.child(0).type.name).toBe('list');
		expect(out.doc.child(0).child(0).type.name).toBe('listItem');
	});

	it('lifts an item out of an existing list', () => {
		const s = select(blockState([list(listItem(para('a')))]), 2);
		let tr = s.tr;

		blockCommand(schema, 'list')!(s, (t) => (tr = t), undefined);
		const out = s.apply(tr);

		expect(out.doc.child(0).type.name).toBe('paragraph');
	});

	it('returns null for a block the schema lacks', () => {
		expect(blockCommand(schema, 'nope')).toBeNull();
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
