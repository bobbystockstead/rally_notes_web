<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { RallyEntry, RallyEntryInput } from '$lib/types/rallyEntry';
	import type { Rally } from '$lib/types/rally';
	import type { Crew } from '$lib/types/crew';
	import { ApiException } from '$lib/types/rallyEntry';
	import {
		listRallyEntries,
		createRallyEntry,
		updateRallyEntry,
		deleteRallyEntry
	} from '$lib/api/rallyEntries';
	import { listRallies } from '$lib/api/rallies';
	import { listCrews } from '$lib/api/crews';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import RallyEntryForm from '$lib/components/RallyEntryForm.svelte';

	let rallyEntries: RallyEntry[] = $state([]);
	let rallies: Rally[] = $state([]);
	let crews: Crew[] = $state([]);
	let rallyNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingRallyEntry: RallyEntry | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchRallyEntries();
	});

	async function fetchRallyEntries() {
		isLoading = true;
		error = null;

		try {
			const [rallyEntriesResult, ralliesResult, crewsResult] = await Promise.all([
				listRallyEntries(),
				listRallies(),
				listCrews()
			]);
			rallyEntries = rallyEntriesResult;
			rallies = ralliesResult;
			crews = crewsResult;
			rallyNamesById = Object.fromEntries(
				ralliesResult.map((rally) => [rally.rally_id, rally.name])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load rallyEntries. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateRallyEntry(data: RallyEntryInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newRallyEntry = await createRallyEntry(data);
			rallyEntries = [...rallyEntries, newRallyEntry];
			showCreateModal = false;
			// Navigate to the newly created rallyEntry's detail page
			await goto(resolve('/rallyentries/[id]', { id: String(newRallyEntry.entry_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create rallyEntry. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(rallyEntry: RallyEntry) {
		editingRallyEntry = rallyEntry;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingRallyEntry = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateRallyEntry(data: RallyEntryInput) {
		if (!editingRallyEntry) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingRallyEntryId = editingRallyEntry.entry_id;
			await updateRallyEntry(editingRallyEntryId, data);
			rallyEntries = rallyEntries.map((rallyEntry) =>
				rallyEntry.entry_id === editingRallyEntryId ? { ...rallyEntry, ...data } : rallyEntry
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update rallyEntry. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteRallyEntry(id: number) {
		if (!confirm('Are you sure you want to delete this rallyEntry?')) {
			return;
		}

		try {
			await deleteRallyEntry(id);
			rallyEntries = rallyEntries.filter((d) => d.entry_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete rallyEntry';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">RallyEntries</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New RallyEntry
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if rallyEntries.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No rallyEntries yet</h3>
			<p>Create your first rallyEntry to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First RallyEntry
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Rally</th>
						<th>Crew</th>
						<th>Car Number</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each rallyEntries as rallyEntry (rallyEntry.entry_id)}
						<tr>
							<td>{rallyEntry.entry_id}</td>
							<td>{rallyNamesById[rallyEntry.rally_id] ?? `ID ${rallyEntry.rally_id}`}</td>
							<td>{rallyEntry.crew_id}</td>
							<td>{rallyEntry.car_number ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/rallyentries/[id]', { id: String(rallyEntry.entry_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button
										class="btn btn-sm btn-secondary"
										onclick={() => openEditModal(rallyEntry)}
									>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteRallyEntry(rallyEntry.entry_id)}
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
		title="Create New RallyEntry"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<RallyEntryForm
			rallyOptions={rallies}
			crewOptions={crews}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateRallyEntry}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit RallyEntry" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingRallyEntry}
			<RallyEntryForm
				initialData={editingRallyEntry}
				rallyOptions={rallies}
				crewOptions={crews}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateRallyEntry}
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
