<script lang="ts">
	import { EditorState } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import { keymap } from 'prosemirror-keymap';
	import { baseKeymap, toggleMark } from 'prosemirror-commands';
	import { history, redo, undo } from 'prosemirror-history';
	import { schema } from './schema';
	import { fromPM } from './bridge';
	import { generate } from '../generate';

	let {
		value = $bindable(''),
		disabled = false,
		placeholder = '',
		onSubmit
	}: {
		value?: string;
		disabled?: boolean;
		placeholder?: string;
		/** Mod-Enter handler */
		onSubmit?: () => void;
	} = $props();

	let host: HTMLElement;
	let view: EditorView | undefined;

	export function clear() {
		if (view === undefined) {
			return;
		}

		view.updateState(EditorState.create({ schema, plugins }));
		value = '';
	}

	export function focus() {
		view?.focus();
	}

	const plugins = [
		history(),
		keymap({
			'Mod-z': undo,
			'Shift-Mod-z': redo,
			'Mod-y': redo,
			'Mod-b': toggleMark(schema.marks.bold),
			'Mod-i': toggleMark(schema.marks.italic),
			'Mod-u': toggleMark(schema.marks.underline),
			'Mod-Enter': () => {
				if (onSubmit === undefined) {
					return false;
				}

				onSubmit();
				return true;
			}
		}),
		keymap(baseKeymap)
	];

	$effect(() => {
		const v = new EditorView(host, {
			state: EditorState.create({ schema, plugins }),

			dispatchTransaction(tr) {
				const state = v.state.apply(tr);
				v.updateState(state);

				if (tr.docChanged) {
					value = generate(fromPM(state.doc));
				}
			}
		});

		view = v;

		return () => {
			view = undefined;
			v.destroy();
		};
	});

	$effect(() => {
		view?.setProps({ editable: () => !disabled });
	});
</script>

<div
	class="ucp-editor"
	class:disabled
	class:empty={value === ''}
	data-placeholder={placeholder}
	bind:this={host}
></div>
