<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Call, CallInput } from '$lib/types/call';
	import type { NoteSet } from '$lib/types/noteSet';
	import type { Intensity } from '$lib/types/intensity';
	import type { Warning } from '$lib/types/warning';
	import type { Tip } from '$lib/types/tip';
	import { ApiException } from '$lib/types/call';
	import { getCall, updateCall, deleteCall } from '$lib/api/calls';
	import { listNoteSets } from '$lib/api/noteSets';
	import { listIntensities } from '$lib/api/intensities';
	import { listWarnings } from '$lib/api/warnings';
	import { listTips } from '$lib/api/tips';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CallForm from '$lib/components/CallForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let call: Call | null = $state(null);
	let noteSets: NoteSet[] = $state([]);
	let intensities: Intensity[] = $state([]);
	let warnings: Warning[] = $state([]);
	let tips: Tip[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const noteSetNamesById = $derived(
		Object.fromEntries(noteSets.map((noteSet) => [noteSet.note_id, noteSet.name]))
	);
	const intensityNamesById = $derived(
		Object.fromEntries(intensities.map((intensity) => [intensity.intensity_id, intensity.name]))
	);
	const warningDescriptionsById = $derived(
		Object.fromEntries(warnings.map((warning) => [warning.warning_id, warning.description]))
	);
	const tipDescriptionsById = $derived(
		Object.fromEntries(tips.map((tip) => [tip.tip_id, tip.description]))
	);

	const callNoteSetName = $derived.by(() => {
		const noteId = call?.note_id;
		if (noteId == null) {
			return null;
		}

		return noteSetNamesById[noteId] ?? null;
	});

	const callIntensityName = $derived.by(() => {
		const intensityId = call?.intensity_id;
		if (intensityId == null) {
			return null;
		}

		return intensityNamesById[intensityId] ?? null;
	});

	const callWarningDescription = $derived.by(() => {
		const warningId = call?.warning_id;
		if (warningId == null) {
			return null;
		}

		return warningDescriptionsById[warningId] ?? null;
	});

	const callTipDescription = $derived.by(() => {
		const tipId = call?.tip_id;
		if (tipId == null) {
			return null;
		}

		return tipDescriptionsById[tipId] ?? null;
	});

	onMount(async () => {
		await fetchCall(data.callId);
	});

	async function fetchCall(id: number) {
		isLoading = true;
		error = null;

		try {
			const [callResult, noteSetsResult, intensitiesResult, warningsResult, tipsResult] =
				await Promise.all([
					getCall(id),
					listNoteSets(),
					listIntensities(),
					listWarnings(),
					listTips()
				]);
			call = callResult;
			noteSets = noteSetsResult;
			intensities = intensitiesResult;
			warnings = warningsResult;
			tips = tipsResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Call not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load call. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateCall(data: CallInput) {
		if (!call) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateCall(call.call_id, data);
			call = { ...call, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update call. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteCall() {
		if (!call) return;

		if (!confirm('Are you sure you want to delete this call?')) {
			return;
		}

		try {
			await deleteCall(call.call_id);
			await goto(resolve('/calls'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete call';
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
	{:else if call}
		<div class="page-header">
			<div>
				<a href={resolve('/calls')} class="back-link">← Back to Calls</a>
				<h1 class="page-title">{call.sequence_number}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteCall}> Delete </button>
			</div>
		</div>

		<div class="call-card">
			<div class="call-field">
				<span class="label">ID</span>
				<p>{call.call_id}</p>
			</div>
			<div class="call-field">
				<span class="label">Note</span>
				<p>{callNoteSetName ?? call.note_id}</p>
			</div>
			<div class="call-field">
				<span class="label">Sequence Number</span>
				<p>{call.sequence_number}</p>
			</div>
			<div class="call-field">
				<span class="label">Gear</span>
				<p>{call.gear ?? '—'}</p>
			</div>
			<div class="call-field">
				<span class="label">Direction</span>
				<p>{call.direction ?? '—'}</p>
			</div>
			<div class="call-field">
				<span class="label">Distance</span>
				<p>{call.distance ?? '—'}</p>
			</div>
			<div class="call-field">
				<span class="label">Intensity</span>
				<p>{callIntensityName ?? call.intensity_id ?? '—'}</p>
			</div>
			<div class="call-field">
				<span class="label">Warning</span>
				<p>{callWarningDescription ?? call.warning_id ?? '—'}</p>
			</div>
			<div class="call-field">
				<span class="label">Tip</span>
				<p>{callTipDescription ?? call.tip_id ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Call not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Call"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if call}
			<CallForm
				initialData={call}
				noteSetOptions={noteSets}
				intensityOptions={intensities}
				warningOptions={warnings}
				tipOptions={tips}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCall}
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

	.call-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.call-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.call-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.call-field p {
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

		.call-card {
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
