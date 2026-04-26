<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Tip, TipInput } from '$lib/types/tip';
	import { ApiException } from '$lib/types/tip';
	import { listTips, createTip, updateTip, deleteTip } from '$lib/api/tips';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import TipForm from '$lib/components/TipForm.svelte';

	let tips: Tip[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingTip: Tip | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchTips();
	});

	async function fetchTips() {
		isLoading = true;
		error = null;

		try {
			tips = await listTips();
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load tips. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateTip(data: TipInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newTip = await createTip(data);
			tips = [...tips, newTip];
			showCreateModal = false;
			// Navigate to the newly created tip's detail page
			await goto(resolve('/tips/[id]', { id: String(newTip.tip_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create tip. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(tip: Tip) {
		editingTip = tip;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingTip = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateTip(data: TipInput) {
		if (!editingTip) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingTipId = editingTip.tip_id;
			await updateTip(editingTipId, data);
			tips = tips.map((tip) => (tip.tip_id === editingTipId ? { ...tip, ...data } : tip));
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update tip. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteTip(id: number) {
		if (!confirm('Are you sure you want to delete this tip?')) {
			return;
		}

		try {
			await deleteTip(id);
			tips = tips.filter((d) => d.tip_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete tip';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Tips</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Tip </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if tips.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No tips yet</h3>
			<p>Create your first tip to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Tip
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
					{#each tips as tip (tip.tip_id)}
						<tr>
							<td>{tip.tip_id}</td>
							<td>{tip.description}</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/tips/[id]', {
											id: String(tip.tip_id)
										})}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(tip)}>
										Edit
									</button>
									<button class="btn btn-sm btn-danger" onclick={() => handleDeleteTip(tip.tip_id)}>
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
		title="Create New Tip"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<TipForm
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateTip}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Tip" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingTip}
			<TipForm
				initialData={editingTip}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateTip}
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
