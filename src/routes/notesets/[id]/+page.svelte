<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { NoteSet, NoteSetInput } from '$lib/types/noteSet';
	import type { Crew } from '$lib/types/crew';
	import type { Stage } from '$lib/types/stage';
	import { ApiException } from '$lib/types/noteSet';
	import { getNoteSet, updateNoteSet, deleteNoteSet } from '$lib/api/noteSets';
	import { listCrews } from '$lib/api/crews';
	import { listStages } from '$lib/api/stages';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import NoteSetForm from '$lib/components/NoteSetForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let noteSet: NoteSet | null = $state(null);
	let crews: Crew[] = $state([]);
	let stages: Stage[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const stageNamesById = $derived(
		Object.fromEntries(stages.map((stage) => [stage.stage_id, stage.name]))
	);

	const noteSetStageName = $derived.by(() => {
		const stageId = noteSet?.stage_id;
		if (stageId == null) {
			return null;
		}

		return stageNamesById[stageId] ?? null;
	});

	onMount(async () => {
		await fetchNoteSet(data.noteSetId);
	});

	async function fetchNoteSet(id: number) {
		isLoading = true;
		error = null;

		try {
			const [noteSetResult, crewsResult, stagesResult] = await Promise.all([
				getNoteSet(id),
				listCrews(),
				listStages()
			]);
			noteSet = noteSetResult;
			crews = crewsResult;
			stages = stagesResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'NoteSet not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load noteSet. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateNoteSet(data: NoteSetInput) {
		if (!noteSet) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateNoteSet(noteSet.note_id, data);
			noteSet = { ...noteSet, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update noteSet. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteNoteSet() {
		if (!noteSet) return;

		if (!confirm('Are you sure you want to delete this noteSet?')) {
			return;
		}

		try {
			await deleteNoteSet(noteSet.note_id);
			await goto(resolve('/notesets'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete noteSet';
		}
	}
</script>

<div class="container">
	{#if error}
		<div style="margin-bottom: 1rem;">
			<ErrorAlert message={error} onDismiss={() => (error = null)} />
		</div>
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if noteSet}
		<div class="page-header">
			<div>
				<a href={resolve('/notesets')} class="back-link">← Back to NoteSets</a>
				<h1 class="page-title">{noteSet.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteNoteSet}> Delete </button>
			</div>
		</div>

		<div class="noteSet-card">
			<div class="noteSet-field">
				<span class="label">ID</span>
				<p>{noteSet.note_id}</p>
			</div>
			<div class="noteSet-field">
				<span class="label">Crew</span>
				<p>{noteSet.crew_id}</p>
			</div>
			<div class="noteSet-field">
				<span class="label">Name</span>
				<p>{noteSet.name}</p>
			</div>
			<div class="noteSet-field">
				<span class="label">Stage</span>
				<p>{noteSetStageName ?? noteSet.stage_id ?? '—'}</p>
			</div>
			<div class="noteSet-field">
				<span class="label">Conditions</span>
				<p>{noteSet.conditions}</p>
			</div>
		</div>
	{:else}
		<p>NoteSet not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit NoteSet"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if noteSet}
			<NoteSetForm
				initialData={noteSet}
				crewOptions={crews}
				stageOptions={stages}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateNoteSet}
				onCancel={() => {
					showEditModal = false;
					submitError = null;
					fieldErrors = {};
				}}
			/>
		{/if}
	</Modal>
</div>

<style>
	.back-link {
		display: inline-block;
		margin-bottom: 0.5rem;
		color: var(--color-primary);
		font-size: 0.95rem;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.noteSet-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.noteSet-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.noteSet-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.noteSet-field p {
		margin: 0;
		color: var(--color-text);
		font-size: 1.1rem;
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: var(--color-error-dark);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
		}

		.noteSet-card {
			grid-template-columns: 1fr;
		}

		.page-header > div:last-child {
			display: flex;
			gap: 0.5rem;
		}

		.page-header .btn {
			flex: 1;
			justify-content: center;
		}
	}
</style>
