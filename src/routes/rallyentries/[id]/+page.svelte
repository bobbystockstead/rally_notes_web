<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { RallyEntry, RallyEntryInput } from '$lib/types/rallyEntry';
	import type { Rally } from '$lib/types/rally';
	import type { Crew } from '$lib/types/crew';
	import { ApiException } from '$lib/types/rallyEntry';
	import { getRallyEntry, updateRallyEntry, deleteRallyEntry } from '$lib/api/rallyEntries';
	import { listRallies } from '$lib/api/rallies';
	import { listCrews } from '$lib/api/crews';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import RallyEntryForm from '$lib/components/RallyEntryForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let rallyEntry: RallyEntry | null = $state(null);
	let rallies: Rally[] = $state([]);
	let crews: Crew[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const rallyNamesById = $derived(
		Object.fromEntries(rallies.map((rally) => [rally.rally_id, rally.name]))
	);

	const rallyEntryRallyName = $derived.by(() => {
		const rallyId = rallyEntry?.rally_id;
		if (rallyId == null) {
			return null;
		}

		return rallyNamesById[rallyId] ?? null;
	});

	onMount(async () => {
		await fetchRallyEntry(data.rallyEntryId);
	});

	async function fetchRallyEntry(id: number) {
		isLoading = true;
		error = null;

		try {
			const [rallyEntryResult, ralliesResult, crewsResult] = await Promise.all([
				getRallyEntry(id),
				listRallies(),
				listCrews()
			]);
			rallyEntry = rallyEntryResult;
			rallies = ralliesResult;
			crews = crewsResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'RallyEntry not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load rallyEntry. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateRallyEntry(data: RallyEntryInput) {
		if (!rallyEntry) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateRallyEntry(rallyEntry.entry_id, data);
			rallyEntry = { ...rallyEntry, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update rallyEntry. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteRallyEntry() {
		if (!rallyEntry) return;

		if (!confirm('Are you sure you want to delete this rallyEntry?')) {
			return;
		}

		try {
			await deleteRallyEntry(rallyEntry.entry_id);
			await goto(resolve('/rallyentries'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete rallyEntry';
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
	{:else if rallyEntry}
		<div class="page-header">
			<div>
				<a href={resolve('/rallyentries')} class="back-link">← Back to RallyEntries</a>
				<h1 class="page-title">{rallyEntry.entry_id} {rallyEntryRallyName}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteRallyEntry}> Delete </button>
			</div>
		</div>

		<div class="rallyEntry-card">
			<div class="rallyEntry-field">
				<span class="label">RallyEntry ID</span>
				<p>{rallyEntry.entry_id}</p>
			</div>
			<div class="rallyEntry-field">
				<span class="label">RallyEntry Rally</span>
				<p>{rallyEntryRallyName ?? rallyEntry.rally_id ?? '—'}</p>
			</div>
			<div class="rallyEntry-field">
				<span class="label">RallyEntry Crew</span>
				<p>{rallyEntry.crew_id ?? '—'}</p>
			</div>
			<div class="rallyEntry-field">
				<span class="label">RallyEntry Car</span>
				<p>{rallyEntry.car_number ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>RallyEntry not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit RallyEntry"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if rallyEntry}
			<RallyEntryForm
				initialData={rallyEntry}
				rallyOptions={rallies}
				crewOptions={crews}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateRallyEntry}
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

	.rallyEntry-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.rallyEntry-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.rallyEntry-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.rallyEntry-field p {
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

		.rallyEntry-card {
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
