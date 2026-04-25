<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Manufacturer, ManufacturerInput } from '$lib/types/manufacturer';
	import { ApiException } from '$lib/types/manufacturer';
	import {
		listManufacturers,
		createManufacturer,
		updateManufacturer,
		deleteManufacturer
	} from '$lib/api/manufacturers';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import ManufacturerForm from '$lib/components/ManufacturerForm.svelte';

	let manufacturers: Manufacturer[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingManufacturer: Manufacturer | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchManufacturers();
	});

	async function fetchManufacturers() {
		isLoading = true;
		error = null;

		try {
			manufacturers = await listManufacturers();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load manufacturers. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateManufacturer(data: ManufacturerInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newManufacturer = await createManufacturer(data);
			manufacturers = [...manufacturers, newManufacturer];
			showCreateModal = false;
			// Navigate to the newly created manufacturer's detail page
			await goto(resolve('/manufacturers/[id]', { id: String(newManufacturer.manufacturer_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create manufacturer. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(manufacturer: Manufacturer) {
		editingManufacturer = manufacturer;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingManufacturer = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateManufacturer(data: ManufacturerInput) {
		if (!editingManufacturer) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingManufacturerId = editingManufacturer.manufacturer_id;
			await updateManufacturer(editingManufacturerId, data);
			manufacturers = manufacturers.map((manufacturer) =>
				manufacturer.manufacturer_id === editingManufacturerId
					? { ...manufacturer, ...data }
					: manufacturer
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update manufacturer. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteManufacturer(id: number) {
		if (!confirm('Are you sure you want to delete this manufacturer?')) {
			return;
		}

		try {
			await deleteManufacturer(id);
			manufacturers = manufacturers.filter((d) => d.manufacturer_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete manufacturer';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Manufacturers</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New Manufacturer
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if manufacturers.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No manufacturers yet</h3>
			<p>Create your first manufacturer to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Manufacturer
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each manufacturers as manufacturer (manufacturer.manufacturer_id)}
						<tr>
							<td>{manufacturer.manufacturer_id}</td>
							<td>{manufacturer.name}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/manufacturers/[id]', {
											id: String(manufacturer.manufacturer_id)
										})}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button
										class="btn btn-sm btn-secondary"
										onclick={() => openEditModal(manufacturer)}
									>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteManufacturer(manufacturer.manufacturer_id)}
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
		title="Create New Manufacturer"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<ManufacturerForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateManufacturer}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Manufacturer" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingManufacturer}
			<ManufacturerForm
				initialData={editingManufacturer}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateManufacturer}
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
