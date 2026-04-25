<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Manufacturer, ManufacturerInput } from '$lib/types/manufacturer';
	import { ApiException } from '$lib/types/manufacturer';
	import { getManufacturer, updateManufacturer, deleteManufacturer } from '$lib/api/manufacturers';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import ManufacturerForm from '$lib/components/ManufacturerForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let manufacturer: Manufacturer | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	onMount(async () => {
		await fetchManufacturer(data.manufacturerId);
	});

	async function fetchManufacturer(id: number) {
		isLoading = true;
		error = null;

		try {
			manufacturer = await getManufacturer(id);
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Manufacturer not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load manufacturer. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateManufacturer(data: ManufacturerInput) {
		if (!manufacturer) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateManufacturer(manufacturer.manufacturer_id, data);
			manufacturer = { ...manufacturer, ...data };
			showEditModal = false;
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

	async function handleDeleteManufacturer() {
		if (!manufacturer) return;

		if (!confirm('Are you sure you want to delete this manufacturer?')) {
			return;
		}

		try {
			await deleteManufacturer(manufacturer.manufacturer_id);
			await goto(resolve('/manufacturers'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete manufacturer';
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
	{:else if manufacturer}
		<div class="page-header">
			<div>
				<a href={resolve('/manufacturers')} class="back-link">← Back to Manufacturers</a>
				<h1 class="page-title">{manufacturer.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteManufacturer}> Delete </button>
			</div>
		</div>

		<div class="manufacturer-card">
			<div class="manufacturer-field">
				<span class="label">Manufacturer ID</span>
				<p>{manufacturer.manufacturer_id}</p>
			</div>
			<div class="manufacturer-field">
				<span class="label">Name</span>
				<p>{manufacturer.name}</p>
			</div>
		</div>
	{:else}
		<p>Manufacturer not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Manufacturer"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if manufacturer}
			<ManufacturerForm
				initialData={manufacturer}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateManufacturer}
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

	.manufacturer-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.manufacturer-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.manufacturer-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.manufacturer-field p {
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

		.manufacturer-card {
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
