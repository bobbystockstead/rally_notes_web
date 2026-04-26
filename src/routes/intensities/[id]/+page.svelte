<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Intensity, IntensityInput } from '$lib/types/intensity';
	import { ApiException } from '$lib/types/intensity';
	import { getIntensity, updateIntensity, deleteIntensity } from '$lib/api/intensities';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import IntensityForm from '$lib/components/IntensityForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let intensity: Intensity | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	onMount(async () => {
		await fetchIntensity(data.intensityId);
	});

	async function fetchIntensity(id: number) {
		isLoading = true;
		error = null;

		try {
			intensity = await getIntensity(id);
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Intensity not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load intensity. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateIntensity(data: IntensityInput) {
		if (!intensity) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateIntensity(intensity.intensity_id, data);
			intensity = { ...intensity, ...data };
			showEditModal = false;
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

	async function handleDeleteIntensity() {
		if (!intensity) return;

		if (!confirm('Are you sure you want to delete this intensity?')) {
			return;
		}

		try {
			await deleteIntensity(intensity.intensity_id);
			await goto(resolve('/intensities'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete intensity';
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
	{:else if intensity}
		<div class="page-header">
			<div>
				<a href={resolve('/intensities')} class="back-link">← Back to Intensities</a>
				<h1 class="page-title">{intensity.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteIntensity}> Delete </button>
			</div>
		</div>

		<div class="intensity-card">
			<div class="intensity-field">
				<span class="label">Intensity ID</span>
				<p>{intensity.intensity_id}</p>
			</div>
			<div class="intensity-field">
				<span class="label">Name</span>
				<p>{intensity.name}</p>
			</div>
		</div>
	{:else}
		<p>Intensity not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Intensity"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if intensity}
			<IntensityForm
				initialData={intensity}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateIntensity}
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

	.intensity-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.intensity-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.intensity-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.intensity-field p {
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

		.intensity-card {
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
