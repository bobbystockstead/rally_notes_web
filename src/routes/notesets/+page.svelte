<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { NoteSet, NoteSetInput } from '$lib/types/noteSet';
	import type { Crew } from '$lib/types/crew';
	import type { Stage } from '$lib/types/stage';
	import { ApiException } from '$lib/types/noteSet';
	import { listNoteSets, createNoteSet, updateNoteSet, deleteNoteSet } from '$lib/api/noteSets';
	import { listCrews } from '$lib/api/crews';
	import { listStages } from '$lib/api/stages';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import NoteSetForm from '$lib/components/NoteSetForm.svelte';

	let noteSets: NoteSet[] = $state([]);
	let crews: Crew[] = $state([]);
	let stages: Stage[] = $state([]);
	let stageNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingNoteSet: NoteSet | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchNoteSets();
	});

	async function fetchNoteSets() {
		isLoading = true;
		error = null;

		try {
			const [noteSetsResult, crewsResult, stagesResult] = await Promise.all([
				listNoteSets(),
				listCrews(),
				listStages()
			]);
			noteSets = noteSetsResult;
			crews = crewsResult;
			stages = stagesResult;
			stageNamesById = Object.fromEntries(
				stagesResult.map((stage) => [stage.stage_id, stage.name])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load noteSets. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateNoteSet(data: NoteSetInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newNoteSet = await createNoteSet(data);
			noteSets = [...noteSets, newNoteSet];
			showCreateModal = false;
			// Navigate to the newly created Note Set's detail page
			await goto(resolve('/notesets/[id]', { id: String(newNoteSet.note_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create noteSet. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(noteSet: NoteSet) {
		editingNoteSet = noteSet;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingNoteSet = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateNoteSet(data: NoteSetInput) {
		if (!editingNoteSet) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingNoteSetId = editingNoteSet.note_id;
			await updateNoteSet(editingNoteSetId, data);
			noteSets = noteSets.map((noteSet) =>
				noteSet.note_id === editingNoteSetId ? { ...noteSet, ...data } : noteSet
			);
			closeEditModal();
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

	async function handleDeleteNoteSet(id: number) {
		if (!confirm('Are you sure you want to delete this noteSet?')) {
			return;
		}

		try {
			await deleteNoteSet(id);
			noteSets = noteSets.filter((d) => d.note_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete noteSet';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">NoteSets</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New NoteSet
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if noteSets.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No noteSets yet</h3>
			<p>Create your first Note Set to get started.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First NoteSet
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Crew ID</th>
						<th>Name</th>
						<th>Stage</th>
						<th>Conditions</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each noteSets as noteSet (noteSet.note_id)}
						<tr>
							<td>{noteSet.note_id}</td>
							<td>{noteSet.crew_id}</td>
							<td>{noteSet.name}</td>
							<td>
								{stageNamesById[noteSet.stage_id] ?? `ID ${noteSet.stage_id}`}
							</td>
							<td>{noteSet.conditions ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/notesets/[id]', { id: String(noteSet.note_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(noteSet)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteNoteSet(noteSet.note_id)}
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<Modal
		isOpen={showCreateModal}
		title="Create New NoteSet"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<NoteSetForm
			crewOptions={crews}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateNoteSet}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit NoteSet" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingNoteSet}
			<NoteSetForm
				initialData={editingNoteSet}
				crewOptions={crews}
				stageOptions={stages}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateNoteSet}
				onCancel={closeEditModal}
			/>
		{/if}
	</Modal>
</div>

<style>
	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn-sm {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
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

	a.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		cursor: pointer;
	}

	@media (max-width: 768px) {
		.action-buttons {
			flex-direction: column;
		}

		.btn-sm {
			width: 100%;
			justify-content: center;
		}
	}
</style>
