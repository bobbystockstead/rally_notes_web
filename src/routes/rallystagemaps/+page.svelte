<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { RallyStageMap, RallyStageMapInput } from '$lib/types/rallyStageMap';
	import type { Rally } from '$lib/types/rally';
	import type { Stage } from '$lib/types/stage';
	import { ApiException } from '$lib/types/rallyStageMap';
	import {
		listRallyStageMaps,
		createRallyStageMap,
		updateRallyStageMap,
		deleteRallyStageMap
	} from '$lib/api/rallyStageMaps';
	import { listRallies } from '$lib/api/rallies';
	import { listStages } from '$lib/api/stages';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import RallyStageMapForm from '$lib/components/RallyStageMapForm.svelte';

	let rallyStageMaps: RallyStageMap[] = $state([]);
	let rallys: Rally[] = $state([]);
	let stages: Stage[] = $state([]);
	let rallyNamesById = $state<Record<number, string>>({});
	let stageNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingRallyStageMap: RallyStageMap | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchRallyStageMaps();
	});

	async function fetchRallyStageMaps() {
		isLoading = true;
		error = null;

		try {
			const [rallyStageMapsResult, rallysResult, stagesResult] = await Promise.all([
				listRallyStageMaps(),
				listRallies(),
				listStages()
			]);
			rallyStageMaps = rallyStageMapsResult;
			rallys = rallysResult;
			stages = stagesResult;
			rallyNamesById = Object.fromEntries(
				rallysResult.map((rally) => [rally.rally_id, rally.name])
			);
			stageNamesById = Object.fromEntries(
				stagesResult.map((stage) => [stage.stage_id, stage.name])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load rallyStageMaps. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateRallyStageMap(data: RallyStageMapInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newRallyStageMap = await createRallyStageMap(data);
			rallyStageMaps = [...rallyStageMaps, newRallyStageMap];
			showCreateModal = false;
			// Navigate to the newly created rallyentry's detail page
			await goto(resolve('/rallystagemaps/[id]', { id: String(newRallyStageMap.rally_stage_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create rallyStageMap. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(rallyStageMap: RallyStageMap) {
		editingRallyStageMap = rallyStageMap;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingRallyStageMap = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateRallyStageMap(data: RallyStageMapInput) {
		if (!editingRallyStageMap) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingRallyStageMapId = editingRallyStageMap.rally_stage_id;
			await updateRallyStageMap(editingRallyStageMapId, data);
			rallyStageMaps = rallyStageMaps.map((rallyStageMap) =>
				rallyStageMap.rally_stage_id === editingRallyStageMapId
					? { ...rallyStageMap, ...data }
					: rallyStageMap
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update rallyStageMap. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteRallyStageMap(id: number) {
		if (!confirm('Are you sure you want to delete this rallyStageMap?')) {
			return;
		}

		try {
			await deleteRallyStageMap(id);
			rallyStageMaps = rallyStageMaps.filter((d) => d.rally_stage_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete rallyStageMap';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">RallyStageMaps</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New RallyStageMap
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if rallyStageMaps.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No rallyStageMaps yet</h3>
			<p>Create your first rallyStageMap to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First RallyStageMap
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Rally</th>
						<th>Stage</th>
						<th>Stage Order</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each rallyStageMaps as rallyStageMap (rallyStageMap.rally_stage_id)}
						<tr>
							<td>{rallyStageMap.rally_stage_id}</td>
							<td>{rallyNamesById[rallyStageMap.rally_id] ?? `ID ${rallyStageMap.rally_id}`}</td>
							<td>{stageNamesById[rallyStageMap.stage_id] ?? `ID ${rallyStageMap.stage_id}`}</td>
							<td>{rallyStageMap.stage_order ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/rallystagemaps/[id]', {
											id: String(rallyStageMap.rally_stage_id)
										})}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button
										class="btn btn-sm btn-secondary"
										onclick={() => openEditModal(rallyStageMap)}
									>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteRallyStageMap(rallyStageMap.rally_stage_id)}
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
		title="Create New RallyStageMap"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<RallyStageMapForm
			rallyOptions={rallys}
			stageOptions={stages}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateRallyStageMap}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit RallyStageMap" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingRallyStageMap}
			<RallyStageMapForm
				initialData={editingRallyStageMap}
				rallyOptions={rallys}
				stageOptions={stages}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateRallyStageMap}
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
