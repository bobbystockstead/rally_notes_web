<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Model, ModelInput } from '$lib/types/model';
	import type { Manufacturer } from '$lib/types/manufacturer';
	import { ApiException } from '$lib/types/model';
	import { listModels, createModel, updateModel, deleteModel } from '$lib/api/models';
	import { listManufacturers } from '$lib/api/manufacturers';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import ModelForm from '$lib/components/ModelForm.svelte';

	let models: Model[] = $state([]);
	let manufacturers: Manufacturer[] = $state([]);
	let manufacturerNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingModel: Model | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchModels();
	});

	async function fetchModels() {
		isLoading = true;
		error = null;

		try {
			const [modelsResult, manufacturersResult] = await Promise.all([
				listModels(),
				listManufacturers()
			]);
			models = modelsResult;
			manufacturers = manufacturersResult;
			manufacturerNamesById = Object.fromEntries(
				manufacturersResult.map((manufacturer) => [manufacturer.manufacturer_id, manufacturer.name])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load models. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateModel(data: ModelInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newModel = await createModel(data);
			models = [...models, newModel];
			showCreateModal = false;
			// Navigate to the newly created model's detail page
			await goto(resolve('/models/[id]', { id: String(newModel.model_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create model. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(model: Model) {
		editingModel = model;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingModel = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateModel(data: ModelInput) {
		if (!editingModel) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingModelId = editingModel.model_id;
			await updateModel(editingModelId, data);
			models = models.map((model) =>
				model.model_id === editingModelId ? { ...model, ...data } : model
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update model. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteModel(id: number) {
		if (!confirm('Are you sure you want to delete this model?')) {
			return;
		}

		try {
			await deleteModel(id);
			models = models.filter((d) => d.model_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete model';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Models</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Model </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if models.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No models yet</h3>
			<p>Create your first model to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Model
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Manufacturer</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each models as model (model.model_id)}
						<tr>
							<td>{model.model_id}</td>
							<td>{model.name}</td>
							<td
								>{manufacturerNamesById[model.manufacturer_id] ?? `ID ${model.manufacturer_id}`}</td
							>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/models/[id]', { id: String(model.model_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(model)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteModel(model.model_id)}
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
		title="Create New Model"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<ModelForm
			manufacturerOptions={manufacturers}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateModel}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Model" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingModel}
			<ModelForm
				initialData={editingModel}
				manufacturerOptions={manufacturers}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateModel}
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
