<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Codriver, CodriverInput } from '$lib/types/codriver';
	import { ApiException } from '$lib/types/codriver';
	import { getCodriver, updateCodriver, deleteCodriver } from '$lib/api/codrivers';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CodriverForm from '$lib/components/CodriverForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let codriver: Codriver | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	onMount(async () => {
		await fetchCodriver(data.codriverId);
	});

	async function fetchCodriver(id: number) {
		isLoading = true;
		error = null;

		try {
			codriver = await getCodriver(id);
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Codriver not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load codriver. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateCodriver(data: CodriverInput) {
		if (!codriver) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateCodriver(codriver.codriver_id, data);
			codriver = { ...codriver, ...data };
			showEditModal = false;
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

	async function handleDeleteCodriver() {
		if (!codriver) return;

		if (!confirm('Are you sure you want to delete this codriver?')) {
			return;
		}

		try {
			await deleteCodriver(codriver.codriver_id);
			await goto(resolve('/codrivers'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete codriver';
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
	{:else if codriver}
		<div class="page-header">
			<div>
				<a href={resolve('/codrivers')} class="back-link">← Back to Codrivers</a>
				<h1 class="page-title">{codriver.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteCodriver}> Delete </button>
			</div>
		</div>

		<div class="codriver-card">
			<div class="codriver-field">
				<span class="label">Codriver ID</span>
				<p>{codriver.codriver_id}</p>
			</div>
			<div class="codriver-field">
				<span class="label">Name</span>
				<p>{codriver.name}</p>
			</div>
			<div class="codriver-field">
				<span class="label">Codriver Number</span>
				<p>{codriver.number ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Codriver not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Codriver"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if codriver}
			<CodriverForm
				initialData={codriver}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCodriver}
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

	.codriver-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.codriver-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.codriver-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.codriver-field p {
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

		.codriver-card {
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
