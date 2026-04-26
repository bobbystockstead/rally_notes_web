<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Rally, RallyInput } from '$lib/types/rally';
	import { ApiException } from '$lib/types/rally';
	import { listRallies, createRally, updateRally, deleteRally } from '$lib/api/rallies';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import RallyForm from '$lib/components/RallyForm.svelte';

	let rallies: Rally[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingRally: Rally | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchRallies();
	});

	async function fetchRallies() {
		isLoading = true;
		error = null;

		try {
			rallies = await listRallies();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load rallies. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateRally(data: RallyInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newRally = await createRally(data);
			rallies = [...rallies, newRally];
			showCreateModal = false;
			// Navigate to the newly created rally's detail page
			await goto(resolve('/rallies/[id]', { id: String(newRally.rally_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create rally. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(rally: Rally) {
		editingRally = rally;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingRally = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateRally(data: RallyInput) {
		if (!editingRally) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingRallyId = editingRally.rally_id;
			await updateRally(editingRallyId, data);
			rallies = rallies.map((rally) =>
				rally.rally_id === editingRallyId ? { ...rally, ...data } : rally
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update rally. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteRally(id: number) {
		if (!confirm('Are you sure you want to delete this rally?')) {
			return;
		}

		try {
			await deleteRally(id);
			rallies = rallies.filter((d) => d.rally_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete rally';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Rallies</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Rally </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if rallies.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No rallies yet</h3>
			<p>Create your first rally to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Rally
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Date</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each rallies as rally (rally.rally_id)}
						<tr>
							<td>{rally.rally_id}</td>
							<td>{rally.name}</td>
							<td>{rally.date ?? '—'}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/rallies/[id]', { id: String(rally.rally_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(rally)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteRally(rally.rally_id)}
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
		title="Create New Rally"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<RallyForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateRally}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Rally" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingRally}
			<RallyForm
				initialData={editingRally}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateRally}
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
