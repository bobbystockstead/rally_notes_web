<script lang="ts">
	import type { NoteSet, NoteSetInput, FieldErrors } from '../types/noteSet';
	import type { Crew } from '../types/crew';
	import type { Stage } from '../types/stage';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		initialData?: NoteSet;
		crewOptions?: Crew[];
		stageOptions?: Stage[];
		isLoading?: boolean;
		fieldErrors?: FieldErrors;
		onSubmit: (data: NoteSetInput) => void;
		onCancel: () => void;
	}

	let {
		initialData,
		crewOptions = [],
		stageOptions = [],
		isLoading = false,
		fieldErrors = {},
		onSubmit,
		onCancel
	}: Props = $props();

	type NoteSetFormData = {
		crew_id: number | null;
		name: string;
		stage_id: number | null;
		conditions: string | null;
	};

	let formData = $state<NoteSetFormData>({
		crew_id: null,
		name: '',
		stage_id: null,
		conditions: ''
	});

	$effect(() => {
		formData = initialData
			? {
					crew_id: initialData.crew_id,
					name: initialData.name,
					stage_id: initialData.stage_id,
					conditions: initialData.conditions
				}
			: { crew_id: null, name: '', stage_id: null, conditions: '' };
	});

	const isEditMode = $derived(!!initialData);
	const isFormInvalid = $derived(formData.crew_id === null || formData.stage_id === null);
	const isFormEmpty = $derived(!formData.name.trim());

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const crewId = formData.crew_id;
		const stageId = formData.stage_id;
		if (isFormEmpty || crewId === null || stageId === null) {
			return;
		}
		onSubmit({
			crew_id: crewId,
			name: formData.name,
			stage_id: stageId,
			conditions: formData.conditions
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="crew_id">Crew</label>
		<select
			id="crew_id"
			value={formData.crew_id === null ? '' : String(formData.crew_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.crew_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.crew_id}
		>
			<option value="">No crew</option>
			{#each crewOptions as crew (crew.crew_id)}
				<option value={String(crew.crew_id)}>{crew.crew_id}</option>
			{/each}
		</select>
		{#if fieldErrors.crew_id}
			<span class="field-error">{fieldErrors.crew_id}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="name">Name *</label>
		<input
			id="name"
			type="text"
			bind:value={formData.name}
			placeholder="NoteSet name"
			disabled={isLoading}
			class:input-error={fieldErrors.name}
		/>
		{#if fieldErrors.name}
			<span class="field-error">{fieldErrors.name}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="stage_id">Stage</label>
		<select
			id="stage_id"
			value={formData.stage_id === null ? '' : String(formData.stage_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.stage_id = value === '' ? null : Number(value);
			}}
			required
			disabled={isLoading}
			class:input-error={fieldErrors.stage_id}
		>
			<option value="">Select stage</option>
			{#each stageOptions as stage (stage.stage_id)}
				<option value={String(stage.stage_id)}>{stage.name}</option>
			{/each}
		</select>
		{#if fieldErrors.stage_id}
			<span class="field-error">{fieldErrors.stage_id}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="conditions">Conditions</label>
		<input
			id="conditions"
			type="text"
			bind:value={formData.conditions}
			placeholder="NoteSet conditions"
			disabled={isLoading}
			class:input-error={fieldErrors.conditions}
		/>
		{#if fieldErrors.conditions}
			<span class="field-error">{fieldErrors.conditions}</span>
		{/if}
	</div>

	<div class="form-actions">
		<button
			type="submit"
			disabled={isLoading || isFormInvalid || isFormEmpty}
			class="btn btn-primary"
		>
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
