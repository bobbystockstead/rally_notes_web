<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { RallyStageMap, RallyStageMapInput } from '$lib/types/rallyStageMap';
	import type { Rally } from '$lib/types/rally';
	import type { Stage } from '$lib/types/stage';
	import { ApiException } from '$lib/types/rallyStageMap';
	import {
		getRallyStageMap,
		updateRallyStageMap,
		deleteRallyStageMap
	} from '$lib/api/rallyStageMaps';
	import { listRallies } from '$lib/api/rallies';
	import { listStages } from '$lib/api/stages';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import RallyStageMapForm from '$lib/components/RallyStageMapForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let rallyStageMap: RallyStageMap | null = $state(null);
	let rallies: Rally[] = $state([]);
	let stages: Stage[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const rallyNamesById = $derived(
		Object.fromEntries(rallies.map((rally) => [rally.rally_id, rally.name]))
	);

	const rallyStageMapRallyName = $derived.by(() => {
		const rallyId = rallyStageMap?.rally_id;
		if (rallyId == null) {
			return null;
		}

		return rallyNamesById[rallyId] ?? null;
	});

	onMount(async () => {
		await fetchRallyStageMap(data.rallyStageMapId);
	});

	async function fetchRallyStageMap(id: number) {
		isLoading = true;
		error = null;

		try {
			const [rallyStageMapResult, ralliesResult, stagesResult] = await Promise.all([
				getRallyStageMap(id),
				listRallies(),
				listStages()
			]);
			rallyStageMap = rallyStageMapResult;
			rallies = ralliesResult;
			stages = stagesResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'RallyStageMap not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load rallyStageMap. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateRallyStageMap(data: RallyStageMapInput) {
		if (!rallyStageMap) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateRallyStageMap(rallyStageMap.rally_stage_id, data);
			rallyStageMap = { ...rallyStageMap, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update rallyStageMap. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteRallyStageMap() {
		if (!rallyStageMap) return;

		if (!confirm('Are you sure you want to delete this rallyStageMap?')) {
			return;
		}

		try {
			await deleteRallyStageMap(rallyStageMap.rally_stage_id);
			await goto(resolve('/rallystagemaps'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete rallyStageMap';
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
	{:else if rallyStageMap}
		<div class="page-header">
			<div>
				<a href={resolve('/rallystagemaps')} class="back-link">← Back to RallyStageMaps</a>
				<h1 class="page-title">{rallyStageMap.rally_stage_id} {rallyStageMapRallyName}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteRallyStageMap}> Delete </button>
			</div>
		</div>

		<div class="rallyStageMap-card">
			<div class="rallyStageMap-field">
				<span class="label">ID</span>
				<p>{rallyStageMap.rally_stage_id}</p>
			</div>
			<div class="rallyStageMap-field">
				<span class="label">Rally</span>
				<p>{rallyStageMapRallyName ?? rallyStageMap.rally_id}</p>
			</div>
			<div class="rallyStageMap-field">
				<span class="label">Stage</span>
				<p>{rallyStageMap.stage_id}</p>
			</div>
			<div class="rallyStageMap-field">
				<span class="label">Stage Order</span>
				<p>{rallyStageMap.stage_order}</p>
			</div>
		</div>
	{:else}
		<p>RallyStageMap not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit RallyStageMap"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if rallyStageMap}
			<RallyStageMapForm
				initialData={rallyStageMap}
				rallyOptions={rallies}
				stageOptions={stages}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateRallyStageMap}
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

	.rallyStageMap-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 2rem;
	}

	.rallyStageMap-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.rallyStageMap-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.rallyStageMap-field p {
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

		.rallyStageMap-card {
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
