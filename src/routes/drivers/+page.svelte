<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Driver, DriverInput } from '$lib/types/driver';
	import { ApiException } from '$lib/types/driver';
	import { listDrivers, createDriver, updateDriver, deleteDriver } from '$lib/api/drivers';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import DriverForm from '$lib/components/DriverForm.svelte';

	let drivers: Driver[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingDriver: Driver | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchDrivers();
	});

	async function fetchDrivers() {
		isLoading = true;
		error = null;

		try {
			drivers = await listDrivers();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load drivers. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateDriver(data: DriverInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newDriver = await createDriver(data);
			drivers = [...drivers, newDriver];
			showCreateModal = false;
			// Navigate to the newly created driver's detail page
			await goto(resolve('/drivers/[id]', { id: String(newDriver.driver_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create driver. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(driver: Driver) {
		editingDriver = driver;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingDriver = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateDriver(data: DriverInput) {
		if (!editingDriver) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingDriverId = editingDriver.driver_id;
			await updateDriver(editingDriverId, data);
			drivers = drivers.map((driver) =>
				driver.driver_id === editingDriverId ? { ...driver, ...data } : driver
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update driver. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteDriver(id: number) {
		if (!confirm('Are you sure you want to delete this driver?')) {
			return;
		}

		try {
			await deleteDriver(id);
			drivers = drivers.filter((d) => d.driver_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete driver';
		}
	}
</script>

/** * Driver List Page - displays all drivers in a table with CRUD actions */

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Drivers</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Driver </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if drivers.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No drivers yet</h3>
			<p>Create your first driver to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Driver
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Number</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each drivers as driver (driver.driver_id)}
						<tr>
							<td>{driver.driver_id}</td>
							<td>{driver.name}</td>
							<td>{driver.number ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/drivers/[id]', { id: String(driver.driver_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(driver)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteDriver(driver.driver_id)}
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
		title="Create New Driver"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<DriverForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateDriver}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Driver" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingDriver}
			<DriverForm
				initialData={editingDriver}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateDriver}
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
