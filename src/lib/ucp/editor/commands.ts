import type { Schema } from 'prosemirror-model';
import { Plugin, type Command, type EditorState } from 'prosemirror-state';
import { baseKeymap, setBlockType, toggleMark } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { history, redo, undo } from 'prosemirror-history';
import { liftListItem, sinkListItem, splitListItem, wrapInList } from 'prosemirror-schema-list';

/**
 * Returns a command that toggles the given mark, or null if the mark is not
 * defined in the schema.
 */
export function markCommand(schema: Schema, name: string): Command | null {
	const type = schema.marks[name];

	return type ? toggleMark(type) : null;
}

/**
 * Returns a command that toggles the given block type, or null if the block is
 * not defined in the schema.
 */
export function blockCommand(schema: Schema, name: string): Command | null {
	const type = schema.nodes[name];

	if (!type) {
		return null;
	}

	if (name === 'list') {
		// toggle: wrap when outside, lift the item when already in a list
		return (state, dispatch) => {
			if (isBlockActive(state, 'listItem')) {
				return liftListItem(schema.nodes.listItem)(state, dispatch);
			}

			return wrapInList(schema.nodes.list)(state, dispatch);
		};
	}

	return (state, dispatch) => {
		if (isBlockActive(state, 'listItem')) {
			return false;
		}

		const target = isBlockActive(state, name) ? schema.nodes.paragraph : type;

		return setBlockType(target)(state, dispatch);
	};
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

export function isBlockActive(state: EditorState, name: string): boolean {
	const { $from } = state.selection;

	for (let depth = $from.depth; depth >= 0; depth--) {
		if ($from.node(depth).type.name === name) {
			return true;
		}
	}

	return false;
}

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

	const listItem = schema.nodes.listItem;

	if (listItem) {
		keys['Enter'] = splitListItem(listItem);
		keys['Tab'] = sinkListItem(listItem);
		keys['Shift-Tab'] = liftListItem(listItem);
	}

	// Google-Docs-style bullet list shortcut
	keys['Mod-Shift-8'] = (state, dispatch) => {
		const command = blockCommand(schema, 'list');

		return command !== null && command(state, dispatch);
	};

	keys['Mod-Enter'] = () => {
		if (opts.onSubmit === undefined) {
			return false;
		}

		opts.onSubmit();
		return true;
	};

	return [history(), keymap(keys), keymap(baseKeymap)];
}
