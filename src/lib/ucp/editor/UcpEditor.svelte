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
	import TextHOneIcon from 'phosphor-svelte/lib/TextHOneIcon';
	import ListBulletsIcon from 'phosphor-svelte/lib/ListBulletsIcon';
	import { schemaFor } from './schema';
	import { fromPM } from './bridge';
	import { generate } from '../generate';
	import { blockCommand, isBlockActive, isMarkActive, markCommand, ucpPlugins } from './commands';
	import type { UcpContext } from '../ast';

	/**
	 * Minimal UCP editor. `value` is out-only: it receives canonical UCP on
	 * every doc change; inbound writes are ignored. Parents reset the editor
	 * via `clear()`.
	 */
	let {
		value = $bindable(''),
		context = 'FORUM',
		disabled = false,
		placeholder = '',
		onSubmit
	}: {
		value?: string;
		context?: UcpContext;
		disabled?: boolean;
		placeholder?: string;
		/** Mod-Enter handler, for submit-on-shortcut forms. */
		onSubmit?: () => void;
	} = $props();

	const editorSchema = $derived(schemaFor(context));

	type Tool = { name: string; kind: 'mark' | 'block'; label: string; icon: Component };

	const TOOLS: Tool[] = [
		{ name: 'bold', kind: 'mark', label: 'Bold', icon: TextBIcon },
		{ name: 'italic', kind: 'mark', label: 'Italic', icon: TextItalicIcon },
		{ name: 'underline', kind: 'mark', label: 'Underline', icon: TextUnderlineIcon },
		{ name: 'strike', kind: 'mark', label: 'Strikethrough', icon: TextStrikethroughIcon },
		{ name: 'code', kind: 'mark', label: 'Code', icon: CodeIcon },
		{ name: 'spoiler', kind: 'mark', label: 'Spoiler', icon: EyeSlashIcon },
		{ name: 'heading', kind: 'block', label: 'Heading', icon: TextHOneIcon },
		{ name: 'list', kind: 'block', label: 'Bullet list', icon: ListBulletsIcon }
	];

	const tools = $derived(
		TOOLS.filter((tool) => {
			if (tool.kind === 'mark') {
				return editorSchema.marks[tool.name] !== undefined;
			} else if (tool.kind === 'block') {
				return editorSchema.nodes[tool.name] !== undefined;
			}

			throw new Error(`Unknown kind: ${tool.kind}`);
		})
	);

	let host: HTMLElement;
	let view: EditorView | undefined;
	let editorState = $state<EditorState>();

	const isEmpty = $derived.by(() => {
		if (editorState === undefined) {
			return value === '';
		}

		return editorState.doc.childCount === 1 &&
			editorState.doc.child(0).type.name === 'paragraph' &&
			editorState.doc.child(0).content.size === 0;
	});

	export function clear() {
		if (view === undefined) {
			return;
		}
		view.updateState(
			EditorState.create({ schema: editorSchema, plugins: ucpPlugins(editorSchema) })
		);
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

		return tool.kind === 'mark'
			? isMarkActive(state, editorSchema, tool.name)
			: isBlockActive(state, tool.name);
	}

	function run(tool: Tool) {
		const current = view;

		if (current === undefined) {
			return;
		}

		const command =
			tool.kind === 'mark'
				? markCommand(editorSchema, tool.name)
				: blockCommand(editorSchema, tool.name);

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
				schema: editorSchema,
				plugins: ucpPlugins(editorSchema, { onSubmit: submit })
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
		{#each tools as tool (tool.name)}
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
		class:empty={isEmpty}
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
