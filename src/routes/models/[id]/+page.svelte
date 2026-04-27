<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Model, ModelInput } from '$lib/types/model';
	import type { Manufacturer } from '$lib/types/manufacturer';
	import { ApiException } from '$lib/types/model';
	import { getModel, updateModel, deleteModel } from '$lib/api/models';
	import { listManufacturers } from '$lib/api/manufacturers';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import ModelForm from '$lib/components/ModelForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let model: Model | null = $state(null);
	let manufacturers: Manufacturer[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const manufacturerNamesById = $derived(
		Object.fromEntries(
			manufacturers.map((manufacturer) => [manufacturer.manufacturer_id, manufacturer.name])
		)
	);

	const modelManufacturerName = $derived.by(() => {
		const manufacturerId = model?.manufacturer_id;
		if (manufacturerId == null) {
			return null;
		}

		return manufacturerNamesById[manufacturerId] ?? null;
	});

	onMount(async () => {
		await fetchModel(data.modelId);
	});

	async function fetchModel(id: number) {
		isLoading = true;
		error = null;

		try {
			const [modelResult, manufacturersResult] = await Promise.all([
				getModel(id),
				listManufacturers()
			]);
			model = modelResult;
			manufacturers = manufacturersResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Model not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load model. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateModel(data: ModelInput) {
		if (!model) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateModel(model.model_id, data);
			model = { ...model, ...data };
			showEditModal = false;
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

	async function handleDeleteModel() {
		if (!model) return;

		if (!confirm('Are you sure you want to delete this model?')) {
			return;
		}

		try {
			await deleteModel(model.model_id);
			await goto(resolve('/models'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete model';
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
	{:else if model}
		<div class="page-header">
			<div>
				<a href={resolve('/models')} class="back-link">← Back to Models</a>
				<h1 class="page-title">{model.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteModel}> Delete </button>
			</div>
		</div>

		<div class="model-card">
			<div class="model-field">
				<span class="label">Model ID</span>
				<p>{model.model_id}</p>
			</div>
			<div class="model-field">
				<span class="label">Name</span>
				<p>{model.name}</p>
			</div>
			<div class="model-field">
				<span class="label">Model Manufacturer</span>
				<p>{modelManufacturerName ?? model.manufacturer_id ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Model not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Model"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if model}
			<ModelForm
				initialData={model}
				manufacturerOptions={manufacturers}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateModel}
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

	.model-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.model-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.model-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.model-field p {
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

		.model-card {
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
