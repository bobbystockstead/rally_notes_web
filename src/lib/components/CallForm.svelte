<script lang="ts">
	import type { Call, CallInput, FieldErrors } from '../types/call';
	import type { NoteSet } from '../types/noteSet';
	import type { Intensity } from '../types/intensity';
	import type { Warning } from '../types/warning';
	import type { Tip } from '../types/tip';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		initialData?: Call;
		noteSetOptions?: NoteSet[];
		intensityOptions?: Intensity[];
		warningOptions?: Warning[];
		tipOptions?: Tip[];
		isLoading?: boolean;
		fieldErrors?: FieldErrors;
		onSubmit: (data: CallInput) => void;
		onCancel: () => void;
	}

	let {
		initialData,
		noteSetOptions = [],
		intensityOptions = [],
		warningOptions = [],
		tipOptions = [],
		isLoading = false,
		fieldErrors = {},
		onSubmit,
		onCancel
	}: Props = $props();

	type CallFormData = {
		note_id: number | null;
		sequence_number: number | null;
		gear: number | null;
		direction: string | null;
		distance: number | null;
		intensity_id: number | null;
		warning_id: number | null;
		tip_id: number | null;
	};

	let formData = $state<CallFormData>({
		note_id: null,
		sequence_number: null,
		gear: null,
		direction: null,
		distance: null,
		intensity_id: null,
		warning_id: null,
		tip_id: null
	});

	$effect(() => {
		formData = initialData
			? {
					note_id: initialData.note_id,
					sequence_number: initialData.sequence_number,
					gear: initialData.gear,
					direction: initialData.direction,
					distance: initialData.distance,
					intensity_id: initialData.intensity_id,
					warning_id: initialData.warning_id,
					tip_id: initialData.tip_id
				}
			: {
					note_id: null,
					sequence_number: null,
					gear: null,
					direction: null,
					distance: null,
					intensity_id: null,
					warning_id: null,
					tip_id: null
				};
	});

	const isEditMode = $derived(!!initialData);
	const isFormInvalid = $derived(formData.note_id === null || formData.sequence_number === null);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const noteId = formData.note_id;
		const sequenceNumber = formData.sequence_number;
		if (noteId === null || sequenceNumber === null) {
			return;
		}
		onSubmit({
			note_id: noteId,
			sequence_number: sequenceNumber,
			gear: formData.gear,
			direction: formData.direction,
			distance: formData.distance,
			intensity_id: formData.intensity_id,
			warning_id: formData.warning_id,
			tip_id: formData.tip_id
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="note_id">Note Set</label>
		<select
			id="note_id"
			value={formData.note_id === null ? '' : String(formData.note_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.note_id = value === '' ? null : Number(value);
			}}
			required
			disabled={isLoading}
			class:input-error={fieldErrors.note_id}
		>
			<option value="">Select a note set</option>
			{#each noteSetOptions as noteSet (noteSet.note_id)}
				<option value={String(noteSet.note_id)}>{noteSet.name}</option>
			{/each}
		</select>
		{#if fieldErrors.note_id}
			<span class="field-error">{fieldErrors.note_id}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="sequence_number">Sequence Number *</label>
		<input
			id="sequence_number"
			type="number"
			bind:value={formData.sequence_number}
			placeholder="Sequence number"
			disabled={isLoading}
			class:input-error={fieldErrors.sequence_number}
		/>
		{#if fieldErrors.sequence_number}
			<span class="field-error">{fieldErrors.sequence_number}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="gear">Gear</label>
		<input
			id="gear"
			type="number"
			bind:value={formData.gear}
			placeholder="Gear"
			disabled={isLoading}
			class:input-error={fieldErrors.gear}
		/>
		{#if fieldErrors.gear}
			<span class="field-error">{fieldErrors.gear}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="direction">Direction</label>
		<input
			id="direction"
			type="text"
			bind:value={formData.direction}
			placeholder="Direction"
			disabled={isLoading}
			class:input-error={fieldErrors.direction}
		/>
		{#if fieldErrors.direction}
			<span class="field-error">{fieldErrors.direction}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="distance">Distance</label>
		<input
			id="distance"
			type="number"
			bind:value={formData.distance}
			placeholder="Distance"
			disabled={isLoading}
			class:input-error={fieldErrors.distance}
		/>
		{#if fieldErrors.distance}
			<span class="field-error">{fieldErrors.distance}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="intensity_id">Intensity</label>
		<select
			id="intensity_id"
			value={formData.intensity_id === null ? '' : String(formData.intensity_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.intensity_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.intensity_id}
		>
			<option value="">No intensity</option>
			{#each intensityOptions as intensity (intensity.intensity_id)}
				<option value={String(intensity.intensity_id)}>{intensity.name}</option>
			{/each}
		</select>
		{#if fieldErrors.intensity_id}
			<span class="field-error">{fieldErrors.intensity_id}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="warning_id">Warning</label>
		<select
			id="warning_id"
			value={formData.warning_id === null ? '' : String(formData.warning_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.warning_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.warning_id}
		>
			<option value="">No warning</option>
			{#each warningOptions as warning (warning.warning_id)}
				<option value={String(warning.warning_id)}>{warning.description}</option>
			{/each}
		</select>
		{#if fieldErrors.warning_id}
			<span class="field-error">{fieldErrors.warning_id}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="tip_id">Tip</label>
		<select
			id="tip_id"
			value={formData.tip_id === null ? '' : String(formData.tip_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.tip_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.tip_id}
		>
			<option value="">No tip</option>
			{#each tipOptions as tip (tip.tip_id)}
				<option value={String(tip.tip_id)}>{tip.description}</option>
			{/each}
		</select>
		{#if fieldErrors.tip_id}
			<span class="field-error">{fieldErrors.tip_id}</span>
		{/if}
	</div>

	<div class="form-actions">
		<button type="submit" disabled={isLoading || isFormInvalid} class="btn btn-primary">
			{#if isLoading}
				<span class="btn-spinner">
					<LoadingSpinner size="small" />
				</span>
			{/if}
			{isEditMode ? 'Update' : 'Create'}
		</button>
		<button type="button" onclick={onCancel} disabled={isLoading} class="btn btn-secondary">
			Cancel
		</button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: var(--color-text);
		font-size: 0.95rem;
	}

	input,
	select {
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1rem;
		color: var(--color-text);
		background-color: var(--color-input-bg);
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input:disabled,
	select:disabled {
		background-color: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
	}

	input.input-error,
	select.input-error {
		border-color: var(--color-error);
	}

	.field-error {
		color: var(--color-error);
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
	}

	.btn-secondary {
		background-color: var(--color-border);
		color: var(--color-text);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-bg-secondary);
	}

	.btn-spinner {
		display: flex;
		align-items: center;
	}
</style>
