<script lang="ts">
	import type { RallyStageMap, RallyStageMapInput, FieldErrors } from '../types/rallyStageMap';
	import type { Rally } from '../types/rally';
	import type { Stage } from '../types/stage';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		initialData?: RallyStageMap;
		rallyOptions?: Rally[];
		stageOptions?: Stage[];
		isLoading?: boolean;
		fieldErrors?: FieldErrors;
		onSubmit: (data: RallyStageMapInput) => void;
		onCancel: () => void;
	}

	let {
		initialData,
		rallyOptions = [],
		stageOptions = [],
		isLoading = false,
		fieldErrors = {},
		onSubmit,
		onCancel
	}: Props = $props();

	type RallyStageMapFormData = {
		rally_id: number | null;
		stage_id: number | null;
		stage_order: number | null;
	};

	let formData = $state<RallyStageMapFormData>({
		rally_id: null,
		stage_id: null,
		stage_order: null
	});

	$effect(() => {
		formData = initialData
			? {
					rally_id: initialData.rally_id,
					stage_id: initialData.stage_id,
					stage_order: initialData.stage_order
				}
			: { rally_id: null, stage_id: null, stage_order: null };
	});

	const isEditMode = $derived(!!initialData);
	const isFormInvalid = $derived(
		formData.rally_id === null || formData.stage_id === null || formData.stage_order === null
	);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const rallyId = formData.rally_id;
		const stageId = formData.stage_id;
		const stageOrder = formData.stage_order;
		if (rallyId === null || stageId === null || stageOrder === null) {
			return;
		}

		onSubmit({
			rally_id: rallyId,
			stage_id: stageId,
			stage_order: stageOrder
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
		<label for="stage_order">Stage Order</label>
		<input
			id="stage_order"
			type="number"
			bind:value={formData.stage_order}
			placeholder="Stage order"
			disabled={isLoading}
			class:input-error={fieldErrors.stage_order}
		/>
		{#if fieldErrors.stage_order}
			<span class="field-error">{fieldErrors.stage_order}</span>
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
