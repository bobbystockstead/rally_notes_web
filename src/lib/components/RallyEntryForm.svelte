<script lang="ts">
	import type { RallyEntry, RallyEntryInput, FieldErrors } from '../types/rallyEntry';
	import type { Rally } from '../types/rally';
	import type { Crew } from '../types/crew';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		initialData?: RallyEntry;
		rallyOptions?: Rally[];
		crewOptions?: Crew[];
		isLoading?: boolean;
		fieldErrors?: FieldErrors;
		onSubmit: (data: RallyEntryInput) => void;
		onCancel: () => void;
	}

	let {
		initialData,
		rallyOptions = [],
		crewOptions = [],
		isLoading = false,
		fieldErrors = {},
		onSubmit,
		onCancel
	}: Props = $props();

	type RallyEntryFormData = {
		rally_id: number | null;
		crew_id: number | null;
		car_number: number | null;
	};

	let formData = $state<RallyEntryFormData>({
		rally_id: null,
		crew_id: null,
		car_number: null
	});

	$effect(() => {
		formData = initialData
			? {
					rally_id: initialData.rally_id,
					crew_id: initialData.crew_id,
					car_number: initialData.car_number
				}
			: { rally_id: null, crew_id: null, car_number: null };
	});

	const isEditMode = $derived(!!initialData);
	const isFormInvalid = $derived(formData.rally_id === null || formData.crew_id === null);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const rallyId = formData.rally_id;
		const crewId = formData.crew_id;
		if (rallyId === null || crewId === null) {
			return;
		}

		onSubmit({
			rally_id: rallyId,
			crew_id: crewId,
			car_number: formData.car_number
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="rally_id">Rally</label>
		<select
			id="rally_id"
			value={formData.rally_id === null ? '' : String(formData.rally_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.rally_id = value === '' ? null : Number(value);
			}}
			required
			disabled={isLoading}
			class:input-error={fieldErrors.rally_id}
		>
			<option value="">Select rally</option>
			{#each rallyOptions as rally (rally.rally_id)}
				<option value={String(rally.rally_id)}>{rally.name}</option>
			{/each}
		</select>
		{#if fieldErrors.rally_id}
			<span class="field-error">{fieldErrors.rally_id}</span>
		{/if}
	</div>
	<div class="form-group">
		<label for="crew_id">Crew</label>
		<select
			id="crew_id"
			value={formData.crew_id === null ? '' : String(formData.crew_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.crew_id = value === '' ? null : Number(value);
			}}
			required
			disabled={isLoading}
			class:input-error={fieldErrors.crew_id}
		>
			<option value="">Select crew</option>
			{#each crewOptions as crew (crew.crew_id)}
				<option value={String(crew.crew_id)}>{crew.crew_id}</option>
			{/each}
		</select>
		{#if fieldErrors.crew_id}
			<span class="field-error">{fieldErrors.crew_id}</span>
		{/if}
	</div>
	<div class="form-group">
		<label for="car_number">Car Number</label>
		<input
			id="car_number"
			type="number"
			bind:value={formData.car_number}
			placeholder="Car number"
			disabled={isLoading}
			class:input-error={fieldErrors.car_number}
		/>
		{#if fieldErrors.car_number}
			<span class="field-error">{fieldErrors.car_number}</span>
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

	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	select:disabled {
		background-color: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
	}

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
