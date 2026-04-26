<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Intensity, IntensityInput } from '$lib/types/intensity';
	import { ApiException } from '$lib/types/intensity';
	import {
		listIntensities,
		createIntensity,
		updateIntensity,
		deleteIntensity
	} from '$lib/api/intensities';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import IntensityForm from '$lib/components/IntensityForm.svelte';

	let intensities: Intensity[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingIntensity: Intensity | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchIntensities();
	});

	async function fetchIntensities() {
		isLoading = true;
		error = null;

		try {
			intensities = await listIntensities();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load intensities. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateIntensity(data: IntensityInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newIntensity = await createIntensity(data);
			intensities = [...intensities, newIntensity];
			showCreateModal = false;
			// Navigate to the newly created intensity's detail page
			await goto(resolve('/intensities/[id]', { id: String(newIntensity.intensity_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create intensity. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(intensity: Intensity) {
		editingIntensity = intensity;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingIntensity = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateIntensity(data: IntensityInput) {
		if (!editingIntensity) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingIntensityId = editingIntensity.intensity_id;
			await updateIntensity(editingIntensityId, data);
			intensities = intensities.map((intensity) =>
				intensity.intensity_id === editingIntensityId ? { ...intensity, ...data } : intensity
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update intensity. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteIntensity(id: number) {
		if (!confirm('Are you sure you want to delete this intensity?')) {
			return;
		}

		try {
			await deleteIntensity(id);
			intensities = intensities.filter((d) => d.intensity_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete intensity';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Intensities</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New Intensity
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if intensities.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No intensities yet</h3>
			<p>Create your first intensity to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Intensity
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
					{#each intensities as intensity (intensity.intensity_id)}
						<tr>
							<td>{intensity.intensity_id}</td>
							<td>{intensity.name}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/intensities/[id]', {
											id: String(intensity.intensity_id)
										})}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(intensity)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteIntensity(intensity.intensity_id)}
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
		title="Create New Intensity"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<IntensityForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateIntensity}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Intensity" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingIntensity}
			<IntensityForm
				initialData={editingIntensity}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateIntensity}
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
