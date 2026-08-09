import type { Schema } from 'prosemirror-model';
import { Plugin, type Command, type EditorState } from 'prosemirror-state';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { history, redo, undo } from 'prosemirror-history';

/**
 * Returns a command that toggles the given mark, or null if the mark is not
 * defined in the schema.
 */
export function markCommand(schema: Schema, name: string): Command | null {
	const type = schema.marks[name];

	return type ? toggleMark(type) : null;
}

/**
 * Determines whether a mark is active in the current selection, which can be
 * used to highlight the corresponding toolbar button.
 */
export function isMarkActive(state: EditorState, schema: Schema, name: string): boolean {
	const type = schema.marks[name];

	if (!type) {
		return false;
	}

	const { from, to, empty, $from } = state.selection;

	if (empty) {
		return type.isInSet(state.storedMarks || $from.marks()) !== undefined;
	}

	return state.doc.rangeHasMark(from, to, type);
}

const MARK_KEYS: [string, string][] = [
	['Mod-b', 'bold'],
	['Mod-i', 'italic'],
	['Mod-u', 'underline'],
	['Mod-Shift-x', 'strike'],
	['Mod-`', 'code'],
	['Mod-Shift-s', 'spoiler']
];

/**
 * The editor's plugins. Marks are bound from MARK_KEYS only when the schema
 * has them.
 */
export function ucpPlugins(schema: Schema, opts: { onSubmit?: () => void } = {}): Plugin[] {
	const keys: Record<string, Command> = {
		'Mod-z': undo,
		'Mod-y': redo,
		'Mod-Shift-z': redo
	};

	for (const [key, name] of MARK_KEYS) {
		const command = markCommand(schema, name);

		if (command !== null) {
			keys[key] = command;
		}
	}

	keys['Mod-Enter'] = () => {
		if (opts.onSubmit === undefined) {
			return false;
		}

		opts.onSubmit();
		return true;
	};

	return [history(), keymap(keys), keymap(baseKeymap)];
}
