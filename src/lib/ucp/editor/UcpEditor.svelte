<script lang="ts">
	import type { Component } from 'svelte';
	import { untrack } from 'svelte';
	import { EditorState } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import TextBIcon from 'phosphor-svelte/lib/TextBIcon';
	import TextItalicIcon from 'phosphor-svelte/lib/TextItalicIcon';
	import TextUnderlineIcon from 'phosphor-svelte/lib/TextUnderlineIcon';
	import TextStrikethroughIcon from 'phosphor-svelte/lib/TextStrikethroughIcon';
	import CodeIcon from 'phosphor-svelte/lib/CodeIcon';
	import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon';
	import { schema } from './schema';
	import { fromPM } from './bridge';
	import { generate } from '../generate';
	import { isMarkActive, markCommand, ucpPlugins } from './commands';
	import type { MarkType } from '../ast';

	/**
	 * Minimal UCP editor. `value` is out-only: it receives canonical UCP on
	 * every doc change; inbound writes are ignored. Parents reset the editor
	 * via `clear()`.
	 */
	let {
		value = $bindable(''),
		disabled = false,
		placeholder = '',
		onSubmit
	}: {
		value?: string;
		disabled?: boolean;
		placeholder?: string;
		/** Mod-Enter handler, for submit-on-shortcut forms. */
		onSubmit?: () => void;
	} = $props();

	type Tool = { name: MarkType; label: string; icon: Component };

	const TOOLS: Tool[] = [
		{ name: 'bold', label: 'Bold', icon: TextBIcon },
		{ name: 'italic', label: 'Italic', icon: TextItalicIcon },
		{ name: 'underline', label: 'Underline', icon: TextUnderlineIcon },
		{ name: 'strike', label: 'Strikethrough', icon: TextStrikethroughIcon },
		{ name: 'code', label: 'Code', icon: CodeIcon },
		{ name: 'spoiler', label: 'Spoiler', icon: EyeSlashIcon }
	];

	let host: HTMLElement;
	let view: EditorView | undefined;
	let editorState = $state<EditorState>();

	export function clear() {
		if (view === undefined) {
			return;
		}
		view.updateState(EditorState.create({ schema, plugins: ucpPlugins(schema) }));
		editorState = view.state;
		value = '';
	}

	export function focus() {
		view?.focus();
	}

	function isActive(tool: Tool): boolean {
		const state = editorState;

		if (state === undefined) {
			return false;
		}

		return isMarkActive(state, schema, tool.name);
	}

	function run(tool: Tool) {
		const current = view;

		if (current === undefined) {
			return;
		}

		const command = markCommand(schema, tool.name);

		if (command === null) {
			return;
		}

		command(current.state, current.dispatch, current);
		current.focus();
	}

	$effect(() => {
		const el = host;
		const submit = untrack(() => onSubmit);

		const v = new EditorView(el, {
			state: EditorState.create({
				schema,
				plugins: ucpPlugins(schema, { onSubmit: submit })
			}),
			dispatchTransaction(tr) {
				const state = v.state.apply(tr);
				v.updateState(state);
				editorState = state;

				if (tr.docChanged) {
					value = generate(fromPM(state.doc));
				}
			}
		});
		view = v;
		editorState = v.state;
		return () => {
			view = undefined;
			editorState = undefined;
			v.destroy();
		};
	});

	$effect(() => {
		view?.setProps({ editable: () => !disabled });
	});
</script>

<div class="ucp-editor" class:disabled>
	<div class="toolbar">
		{#each TOOLS as tool (tool.name)}
			<button
				type="button"
				class="btn btn-icon tool"
				class:active={isActive(tool)}
				title={tool.label}
				aria-label={tool.label}
				aria-pressed={isActive(tool)}
				{disabled}
				onmousedown={(e) => e.preventDefault()}
				onclick={() => run(tool)}
			>
				<tool.icon weight="bold" />
			</button>
		{/each}
	</div>
	<div
		class="surface"
		class:empty={value === ''}
		data-placeholder={placeholder}
		bind:this={host}
	></div>
</div>

<style>
	.toolbar {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-2);
		border-bottom: var(--border-thin) solid var(--color-border);
	}

	.tool {
		color: var(--color-text-secondary);
	}

	.tool.active {
		color: var(--color-accent-600);
		background: var(--color-surface-active);
	}
</style>
