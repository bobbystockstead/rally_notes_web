<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Warning, WarningInput } from '$lib/types/warning';
	import { ApiException } from '$lib/types/warning';
	import { getWarning, updateWarning, deleteWarning } from '$lib/api/warnings';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import WarningForm from '$lib/components/WarningForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let warning: Warning | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	onMount(async () => {
		await fetchWarning(data.warningId);
	});

	async function fetchWarning(id: number) {
		isLoading = true;
		error = null;

		try {
			warning = await getWarning(id);
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Warning not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load warning. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateWarning(data: WarningInput) {
		if (!warning) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateWarning(warning.warning_id, data);
			warning = { ...warning, ...data };
			showEditModal = false;
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

	async function handleDeleteWarning() {
		if (!warning) return;

		if (!confirm('Are you sure you want to delete this warning?')) {
			return;
		}

		try {
			await deleteWarning(warning.warning_id);
			await goto(resolve('/warnings'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete warning';
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
	{:else if warning}
		<div class="page-header">
			<div>
				<a href={resolve('/warnings')} class="back-link">← Back to Warnings</a>
				<h1 class="page-title">{warning.description}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteWarning}> Delete </button>
			</div>
		</div>

		<div class="warning-card">
			<div class="warning-field">
				<span class="label">Warning ID</span>
				<p>{warning.warning_id}</p>
			</div>
			<div class="warning-field">
				<span class="label">Description</span>
				<p>{warning.description}</p>
			</div>
		</div>
	{:else}
		<p>Warning not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Warning"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if warning}
			<WarningForm
				initialData={warning}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateWarning}
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

	.warning-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.warning-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.warning-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.warning-field p {
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

		.warning-card {
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
