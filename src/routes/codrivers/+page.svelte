<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Codriver, CodriverInput } from '$lib/types/codriver';
	import { ApiException } from '$lib/types/codriver';
	import {
		listCodrivers,
		createCodriver,
		updateCodriver,
		deleteCodriver
	} from '$lib/api/codrivers';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CodriverForm from '$lib/components/CodriverForm.svelte';

	let codrivers: Codriver[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingCodriver: Codriver | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchCodrivers();
	});

	async function fetchCodrivers() {
		isLoading = true;
		error = null;

		try {
			codrivers = await listCodrivers();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load codrivers. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateCodriver(data: CodriverInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newCodriver = await createCodriver(data);
			codrivers = [...codrivers, newCodriver];
			showCreateModal = false;
			// Navigate to the newly created codriver's detail page
			await goto(resolve('/codrivers/[id]', { id: String(newCodriver.codriver_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create codriver. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(codriver: Codriver) {
		editingCodriver = codriver;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingCodriver = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateCodriver(data: CodriverInput) {
		if (!editingCodriver) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingCodriverId = editingCodriver.codriver_id;
			await updateCodriver(editingCodriverId, data);
			codrivers = codrivers.map((codriver) =>
				codriver.codriver_id === editingCodriverId ? { ...codriver, ...data } : codriver
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update codriver. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteCodriver(id: number) {
		if (!confirm('Are you sure you want to delete this codriver?')) {
			return;
		}

		try {
			await deleteCodriver(id);
			codrivers = codrivers.filter((d) => d.codriver_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete codriver';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Codrivers</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New Codriver
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if codrivers.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No codrivers yet</h3>
			<p>Create your first codriver to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Codriver
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
					{#each codrivers as codriver (codriver.codriver_id)}
						<tr>
							<td>{codriver.codriver_id}</td>
							<td>{codriver.name}</td>
							<td>{codriver.number ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/codrivers/[id]', { id: String(codriver.codriver_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(codriver)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteCodriver(codriver.codriver_id)}
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
		title="Create New Codriver"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<CodriverForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateCodriver}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Codriver" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingCodriver}
			<CodriverForm
				initialData={editingCodriver}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCodriver}
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
