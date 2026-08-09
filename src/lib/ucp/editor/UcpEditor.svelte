<script lang="ts">
	import { EditorState } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import { keymap } from 'prosemirror-keymap';
	import { baseKeymap, toggleMark } from 'prosemirror-commands';
	import { history, redo, undo } from 'prosemirror-history';
	import { schema } from './schema';
	import { fromPM } from './bridge';
	import { generate } from '../generate';

	let { value = $bindable('') }: { value?: string } = $props();

	let host: HTMLElement;
	let view: EditorView | undefined;

	export function clear() {
		if (view === undefined) {
			return;
		}

		view.updateState(EditorState.create({ schema, plugins }));
		value = '';
		view.focus();
	}

	const plugins = [
		history(),
		keymap({
			'Mod-z': undo,
			'Shift-Mod-z': redo,
			'Mod-y': redo,
			'Mod-b': toggleMark(schema.marks.bold),
			'Mod-i': toggleMark(schema.marks.italic),
			'Mod-u': toggleMark(schema.marks.underline)
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

		return () => v.destroy();
	});
</script>

<div class="ucp-editor" bind:this={host}></div>
