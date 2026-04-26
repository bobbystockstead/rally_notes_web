<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Stage, StageInput } from '$lib/types/stage';
	import { ApiException } from '$lib/types/stage';
	import { listStages, createStage, updateStage, deleteStage } from '$lib/api/stages';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import StageForm from '$lib/components/StageForm.svelte';

	let stages: Stage[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingStage: Stage | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchStages();
	});

	async function fetchStages() {
		isLoading = true;
		error = null;

		try {
			stages = await listStages();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load stages. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateStage(data: StageInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newStage = await createStage(data);
			stages = [...stages, newStage];
			showCreateModal = false;
			// Navigate to the newly created stage's detail page
			await goto(resolve('/stages/[id]', { id: String(newStage.stage_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create stage. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(stage: Stage) {
		editingStage = stage;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingStage = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateStage(data: StageInput) {
		if (!editingStage) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingStageId = editingStage.stage_id;
			await updateStage(editingStageId, data);
			stages = stages.map((stage) =>
				stage.stage_id === editingStageId ? { ...stage, ...data } : stage
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update stage. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteStage(id: number) {
		if (!confirm('Are you sure you want to delete this stage?')) {
			return;
		}

		try {
			await deleteStage(id);
			stages = stages.filter((d) => d.stage_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete stage';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Stages</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Stage </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if stages.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No stages yet</h3>
			<p>Create your first stage to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Stage
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Distance</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each stages as stage (stage.stage_id)}
						<tr>
							<td>{stage.stage_id}</td>
							<td>{stage.name}</td>
							<td>{stage.distance ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/stages/[id]', { id: String(stage.stage_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(stage)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteStage(stage.stage_id)}
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
		title="Create New Stage"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<StageForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateStage}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Stage" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingStage}
			<StageForm
				initialData={editingStage}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateStage}
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
