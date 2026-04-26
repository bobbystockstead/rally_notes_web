<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Warning, WarningInput } from '$lib/types/warning';
	import { ApiException } from '$lib/types/warning';
	import { listWarnings, createWarning, updateWarning, deleteWarning } from '$lib/api/warnings';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import WarningForm from '$lib/components/WarningForm.svelte';

	let warnings: Warning[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingWarning: Warning | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchWarnings();
	});

	async function fetchWarnings() {
		isLoading = true;
		error = null;

		try {
			warnings = await listWarnings();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load warnings. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateWarning(data: WarningInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newWarning = await createWarning(data);
			warnings = [...warnings, newWarning];
			showCreateModal = false;
			// Navigate to the newly created warning's detail page
			await goto(resolve('/warnings/[id]', { id: String(newWarning.warning_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create warning. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(warning: Warning) {
		editingWarning = warning;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingWarning = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateWarning(data: WarningInput) {
		if (!editingWarning) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingWarningId = editingWarning.warning_id;
			await updateWarning(editingWarningId, data);
			warnings = warnings.map((warning) =>
				warning.warning_id === editingWarningId ? { ...warning, ...data } : warning
			);
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update warning. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteWarning(id: number) {
		if (!confirm('Are you sure you want to delete this warning?')) {
			return;
		}

		try {
			await deleteWarning(id);
			warnings = warnings.filter((d) => d.warning_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete warning';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Warnings</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ New Warning
		</button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if warnings.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No warnings yet</h3>
			<p>Create your first warning to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Warning
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Description</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each warnings as warning (warning.warning_id)}
						<tr>
							<td>{warning.warning_id}</td>
							<td>{warning.description}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/warnings/[id]', {
											id: String(warning.warning_id)
										})}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(warning)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteWarning(warning.warning_id)}
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
		title="Create New Warning"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<WarningForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateWarning}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Warning" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingWarning}
			<WarningForm
				initialData={editingWarning}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateWarning}
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
