<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Car, CarInput } from '$lib/types/car';
	import type { Model } from '$lib/types/model';
	import { ApiException } from '$lib/types/car';
	import { listCars, createCar, updateCar, deleteCar } from '$lib/api/cars';
	import { listModels } from '$lib/api/models';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CarForm from '$lib/components/CarForm.svelte';

	let cars: Car[] = $state([]);
	let models: Model[] = $state([]);
	let modelNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingCar: Car | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchCars();
	});

	async function fetchCars() {
		isLoading = true;
		error = null;

		try {
			const [carsResult, modelsResult] = await Promise.all([listCars(), listModels()]);
			cars = carsResult;
			models = modelsResult;
			modelNamesById = Object.fromEntries(
				modelsResult.map((model) => [model.model_id, model.name])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load cars. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateCar(data: CarInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newCar = await createCar(data);
			cars = [...cars, newCar];
			showCreateModal = false;
			// Navigate to the newly created car's detail page
			await goto(resolve('/cars/[id]', { id: String(newCar.car_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create car. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(car: Car) {
		editingCar = car;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingCar = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateCar(data: CarInput) {
		if (!editingCar) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingCarId = editingCar.car_id;
			await updateCar(editingCarId, data);
			cars = cars.map((car) => (car.car_id === editingCarId ? { ...car, ...data } : car));
			closeEditModal();
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

	async function handleDeleteCar(id: number) {
		if (!confirm('Are you sure you want to delete this car?')) {
			return;
		}

		try {
			await deleteCar(id);
			cars = cars.filter((d) => d.car_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete car';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Cars</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Car </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if cars.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No cars yet</h3>
			<p>Create your first car to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Car
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Model</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each cars as car (car.car_id)}
						<tr>
							<td>{car.car_id}</td>
							<td>{car.name}</td>
							<td>
								{car.model_id === null
									? '—'
									: (modelNamesById[car.model_id] ?? `ID ${car.model_id}`)}
							</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/cars/[id]', { id: String(car.car_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(car)}>
										Edit
									</button>
									<button class="btn btn-sm btn-danger" onclick={() => handleDeleteCar(car.car_id)}>
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
		title="Create New Car"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<CarForm
			modelOptions={models}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateCar}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Car" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingCar}
			<CarForm
				initialData={editingCar}
				modelOptions={models}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCar}
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
