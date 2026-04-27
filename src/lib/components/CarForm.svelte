<script lang="ts">
	import type { Car, CarInput, FieldErrors } from '../types/car';
	import type { Model } from '../types/model';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		initialData?: Car;
		modelOptions?: Model[];
		isLoading?: boolean;
		fieldErrors?: FieldErrors;
		onSubmit: (data: CarInput) => void;
		onCancel: () => void;
	}

	let {
		initialData,
		modelOptions = [],
		isLoading = false,
		fieldErrors = {},
		onSubmit,
		onCancel
	}: Props = $props();

	let formData = $state<CarInput>({ name: '', model_id: null });

	$effect(() => {
		formData = initialData
			? { name: initialData.name, model_id: initialData.model_id }
			: { name: '', model_id: null };
	});

	const isEditMode = $derived(!!initialData);
	const isFormEmpty = $derived(!formData.name.trim());

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (isFormEmpty) {
			return;
		}
		onSubmit(formData);
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="name">Name *</label>
		<input
			id="name"
			type="text"
			bind:value={formData.name}
			placeholder="Car name"
			disabled={isLoading}
			class:input-error={fieldErrors.name}
		/>
		{#if fieldErrors.name}
			<span class="field-error">{fieldErrors.name}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="model_id">Model</label>
		<select
			id="model_id"
			value={formData.model_id === null ? '' : String(formData.model_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.model_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.model_id}
		>
			<option value="">No model</option>
			{#each modelOptions as model (model.model_id)}
				<option value={String(model.model_id)}>{model.name}</option>
			{/each}
		</select>
		{#if fieldErrors.model_id}
			<span class="field-error">{fieldErrors.model_id}</span>
		{/if}
	</div>

	<div class="form-actions">
		<button type="submit" disabled={isLoading || isFormEmpty} class="btn btn-primary">
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
