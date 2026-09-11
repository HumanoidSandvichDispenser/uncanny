<script lang="ts">
	import { resolve } from '$app/paths';
	import { getProfile } from '$lib/profiles.svelte';
	import type { MessageThreadHeader } from '@sandvichxyz/pecans';
    import CaretDoubleRightIcon from 'phosphor-svelte/lib/CaretDoubleRightIcon';

	let {
		header
	}: {
		header: MessageThreadHeader;
	} = $props();

    const members = $derived(header.members);

    const memberNames = $derived.by(() => {
        const otherMembers = members.filter((m) => !m.you);

        let anonMemberCount = otherMembers.filter((m) => m.anon).length;

        const namedMemberProfiles = otherMembers
            .filter((m) => !m.anon)
            .map((m) => m.id)
            .filter((id) => id !== undefined)
            .map((id) => getProfile(id));

        anonMemberCount += namedMemberProfiles
            .filter((p) => p === undefined || p.name === undefined)
            .length;

        const namedMemberNames = namedMemberProfiles
            .map((p) => p?.name ?? undefined)
            .filter((name) => name !== undefined);

        // TODO: localize
        const anonMemberNames = anonMemberCount === 0 ? [] : [
            anonMemberCount === 1 ? 'an anonymous user' : `${anonMemberCount} anonymous users`,
        ]

        return [
            ...namedMemberNames,
            ...anonMemberNames,
        ];
    });

    const memberNamesString = $derived(memberNames.join(', '));
</script>

<div class="thread-header">
	<h1 class="subject">
        <a class="text" href={resolve('/messages') + '?inbox=' + header.folder.id}>
            {header.folder.name}
        </a>
        <span class="separator">
            <CaretDoubleRightIcon />
        </span>
        <span>{header.title}</span>
    </h1>
	<span>This is the beginning of your conversation with {memberNamesString}.</span>
</div>

<style>
	.thread-header {
		padding: var(--space-padding-lg);
	}

	.subject {
        display: flex;
        align-items: center;
        gap: var(--space-gap-sm);
		font-weight: 700;
	}

    .subject a {
        font-weight: 500;
        color: var(--color-text-tertiary);
    }

    .subject .separator {
        display: flex;
        color: var(--color-text-tertiary);
    }
</style>
