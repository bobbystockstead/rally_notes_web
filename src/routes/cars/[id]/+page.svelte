<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Car, CarInput } from '$lib/types/car';
	import type { Model } from '$lib/types/model';
	import { ApiException } from '$lib/types/car';
	import { getCar, updateCar, deleteCar } from '$lib/api/cars';
	import { listModels } from '$lib/api/models';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CarForm from '$lib/components/CarForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let car: Car | null = $state(null);
	let models: Model[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const modelNamesById = $derived(
		Object.fromEntries(models.map((model) => [model.model_id, model.name]))
	);

	const carModelName = $derived.by(() => {
		const modelId = car?.model_id;
		if (modelId == null) {
			return null;
		}

		return modelNamesById[modelId] ?? null;
	});

	onMount(async () => {
		await fetchCar(data.carId);
	});

	async function fetchCar(id: number) {
		isLoading = true;
		error = null;

		try {
			const [carResult, modelsResult] = await Promise.all([getCar(id), listModels()]);
			car = carResult;
			models = modelsResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Car not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load car. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateCar(data: CarInput) {
		if (!car) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateCar(car.car_id, data);
			car = { ...car, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update car. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteCar() {
		if (!car) return;

		if (!confirm('Are you sure you want to delete this car?')) {
			return;
		}

		try {
			await deleteCar(car.car_id);
			await goto(resolve('/cars'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete car';
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
	{:else if car}
		<div class="page-header">
			<div>
				<a href={resolve('/cars')} class="back-link">← Back to Cars</a>
				<h1 class="page-title">{car.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteCar}> Delete </button>
			</div>
		</div>

		<div class="car-card">
			<div class="car-field">
				<span class="label">Car ID</span>
				<p>{car.car_id}</p>
			</div>
			<div class="car-field">
				<span class="label">Name</span>
				<p>{car.name}</p>
			</div>
			<div class="car-field">
				<span class="label">Car Model</span>
				<p>{carModelName ?? car.model_id ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Car not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Car"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if car}
			<CarForm
				initialData={car}
				modelOptions={models}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCar}
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

	.car-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.car-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.car-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.car-field p {
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

		.car-card {
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
