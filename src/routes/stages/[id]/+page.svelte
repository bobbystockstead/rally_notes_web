<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Stage, StageInput } from '$lib/types/stage';
	import { ApiException } from '$lib/types/stage';
	import { getStage, updateStage, deleteStage } from '$lib/api/stages';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import StageForm from '$lib/components/StageForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let stage: Stage | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	onMount(async () => {
		await fetchStage(data.stageId);
	});

	async function fetchStage(id: number) {
		isLoading = true;
		error = null;

		try {
			stage = await getStage(id);
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Stage not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load stage. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateStage(data: StageInput) {
		if (!stage) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateStage(stage.stage_id, data);
			stage = { ...stage, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update stage. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteStage() {
		if (!stage) return;

		if (!confirm('Are you sure you want to delete this stage?')) {
			return;
		}

		try {
			await deleteStage(stage.stage_id);
			await goto(resolve('/stages'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete stage';
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
	{:else if stage}
		<div class="page-header">
			<div>
				<a href={resolve('/stages')} class="back-link">← Back to Stages</a>
				<h1 class="page-title">{stage.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteStage}> Delete </button>
			</div>
		</div>

		<div class="stage-card">
			<div class="stage-field">
				<span class="label">Stage ID</span>
				<p>{stage.stage_id}</p>
			</div>
			<div class="stage-field">
				<span class="label">Name</span>
				<p>{stage.name}</p>
			</div>
			<div class="stage-field">
				<span class="label">Stage Distance</span>
				<p>{stage.distance ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Stage not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Stage"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if stage}
			<StageForm
				initialData={stage}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateStage}
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

	.stage-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.stage-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stage-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.stage-field p {
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

		.stage-card {
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
