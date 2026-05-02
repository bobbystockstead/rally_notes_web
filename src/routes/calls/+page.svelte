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
	import { listCalls, createCall, updateCall, deleteCall } from '$lib/api/calls';
	import { listNoteSets } from '$lib/api/noteSets';
	import { listIntensities } from '$lib/api/intensities';
	import { listWarnings } from '$lib/api/warnings';
	import { listTips } from '$lib/api/tips';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CallForm from '$lib/components/CallForm.svelte';

	let calls: Call[] = $state([]);
	let noteSets: NoteSet[] = $state([]);
	let intensities: Intensity[] = $state([]);
	let warnings: Warning[] = $state([]);
	let tips: Tip[] = $state([]);
	let noteSetNamesById = $state<Record<number, string>>({});
	let intensityNamesById = $state<Record<number, string>>({});
	let warningDescriptionsById = $state<Record<number, string>>({});
	let tipDescriptionsById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingCall: Call | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchCalls();
	});

	async function fetchCalls() {
		isLoading = true;
		error = null;

		try {
			const [callsResult, noteSetsResult, intensitiesResult, warningsResult, tipsResult] =
				await Promise.all([
					listCalls(),
					listNoteSets(),
					listIntensities(),
					listWarnings(),
					listTips()
				]);
			calls = callsResult;
			noteSets = noteSetsResult;
			intensities = intensitiesResult;
			warnings = warningsResult;
			tips = tipsResult;
			noteSetNamesById = Object.fromEntries(
				noteSetsResult.map((noteSet) => [noteSet.note_id, noteSet.name])
			);
			intensityNamesById = Object.fromEntries(
				intensitiesResult.map((intensity) => [intensity.intensity_id, intensity.name])
			);
			warningDescriptionsById = Object.fromEntries(
				warningsResult.map((warning) => [warning.warning_id, warning.description])
			);
			tipDescriptionsById = Object.fromEntries(
				tipsResult.map((tip) => [tip.tip_id, tip.description])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load calls. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateCall(data: CallInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newCall = await createCall(data);
			calls = [...calls, newCall];
			showCreateModal = false;
			// Navigate to the newly created Call's detail page
			await goto(resolve('/calls/[id]', { id: String(newCall.call_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create call. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(call: Call) {
		editingCall = call;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingCall = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateCall(data: CallInput) {
		if (!editingCall) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingCallId = editingCall.call_id;
			await updateCall(editingCallId, data);
			calls = calls.map((call) => (call.call_id === editingCallId ? { ...call, ...data } : call));
			closeEditModal();
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

	async function handleDeleteCall(id: number) {
		if (!confirm('Are you sure you want to delete this call?')) {
			return;
		}

		try {
			await deleteCall(id);
			calls = calls.filter((d) => d.call_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete call';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Calls</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Call </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if calls.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No calls yet</h3>
			<p>Create your first Call to get started.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Call
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Note Set</th>
						<th>Sequence Number</th>
						<th>Gear</th>
						<th>Direction</th>
						<th>Distance</th>
						<th>Intensity</th>
						<th>Warning</th>
						<th>Tip</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each calls as call (call.call_id)}
						<tr>
							<td>{call.call_id}</td>
							<td>
								{noteSetNamesById[call.note_id] ?? `ID ${call.note_id}`}
							</td>
							<td>{call.sequence_number}</td>
							<td>{call.gear ?? '—'}</td>
							<td>{call.direction ?? '—'}</td>
							<td>{call.distance ?? '—'}</td>
							<td>
								{call.intensity_id === null
									? '—'
									: (intensityNamesById[call.intensity_id] ?? `ID ${call.intensity_id}`)}
							</td>
							<td>
								{call.warning_id === null
									? '—'
									: (warningDescriptionsById[call.warning_id] ?? `ID ${call.warning_id}`)}
							</td>
							<td>
								{call.tip_id === null
									? '—'
									: (tipDescriptionsById[call.tip_id] ?? `ID ${call.tip_id}`)}
							</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/calls/[id]', { id: String(call.call_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(call)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteCall(call.call_id)}
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
		title="Create New Call"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<CallForm
			noteSetOptions={noteSets}
			intensityOptions={intensities}
			warningOptions={warnings}
			tipOptions={tips}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateCall}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Call" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingCall}
			<CallForm
				initialData={editingCall}
				noteSetOptions={noteSets}
				intensityOptions={intensities}
				warningOptions={warnings}
				tipOptions={tips}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCall}
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
