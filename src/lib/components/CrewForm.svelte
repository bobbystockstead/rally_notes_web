<script lang="ts">
	import type { Crew, CrewInput, FieldErrors } from '../types/crew';
	import type { Driver } from '../types/driver';
	import type { Codriver } from '../types/codriver';
	import type { Car } from '../types/car';
	import type { Team } from '../types/team';
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		initialData?: Crew;
		driverOptions?: Driver[];
		codriverOptions?: Codriver[];
		carOptions?: Car[];
		teamOptions?: Team[];
		isLoading?: boolean;
		fieldErrors?: FieldErrors;
		onSubmit: (data: CrewInput) => void;
		onCancel: () => void;
	}

	let {
		initialData,
		driverOptions = [],
		codriverOptions = [],
		carOptions = [],
		teamOptions = [],
		isLoading = false,
		fieldErrors = {},
		onSubmit,
		onCancel
	}: Props = $props();

	type CrewFormData = {
		driver_id: number | null;
		codriver_id: number | null;
		car_id: number | null;
		team_id: number | null;
	};

	let formData = $state<CrewFormData>({
		driver_id: null,
		codriver_id: null,
		car_id: null,
		team_id: null
	});

	$effect(() => {
		formData = initialData
			? {
					driver_id: initialData.driver_id,
					codriver_id: initialData.codriver_id,
					car_id: initialData.car_id,
					team_id: initialData.team_id
				}
			: { driver_id: null, codriver_id: null, car_id: null, team_id: null };
	});

	const isEditMode = $derived(!!initialData);
	const isFormInvalid = $derived(formData.driver_id === null || formData.codriver_id === null);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const driverId = formData.driver_id;
		const codriverId = formData.codriver_id;
		if (driverId === null || codriverId === null) {
			return;
		}

		onSubmit({
			driver_id: driverId,
			codriver_id: codriverId,
			car_id: formData.car_id,
			team_id: formData.team_id
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<div class="form-group">
		<label for="driver_id">Driver</label>
		<select
			id="driver_id"
			value={formData.driver_id === null ? '' : String(formData.driver_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.driver_id = value === '' ? null : Number(value);
			}}
			required
			disabled={isLoading}
			class:input-error={fieldErrors.driver_id}
		>
			<option value="">Select driver</option>
			{#each driverOptions as driver (driver.driver_id)}
				<option value={String(driver.driver_id)}>{driver.name}</option>
			{/each}
		</select>
		{#if fieldErrors.driver_id}
			<span class="field-error">{fieldErrors.driver_id}</span>
		{/if}
	</div>

	<div class="form-group">
		<label for="codriver_id">Codriver</label>
		<select
			id="codriver_id"
			value={formData.codriver_id === null ? '' : String(formData.codriver_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.codriver_id = value === '' ? null : Number(value);
			}}
			required
			disabled={isLoading}
			class:input-error={fieldErrors.codriver_id}
		>
			<option value="">Select codriver</option>
			{#each codriverOptions as codriver (codriver.codriver_id)}
				<option value={String(codriver.codriver_id)}>{codriver.name}</option>
			{/each}
		</select>
		{#if fieldErrors.codriver_id}
			<span class="field-error">{fieldErrors.codriver_id}</span>
		{/if}
	</div>
	<div class="form-group">
		<label for="car_id">Car</label>
		<select
			id="car_id"
			value={formData.car_id === null ? '' : String(formData.car_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.car_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.car_id}
		>
			<option value="">No car</option>
			{#each carOptions as car (car.car_id)}
				<option value={String(car.car_id)}>{car.name}</option>
			{/each}
		</select>
		{#if fieldErrors.car_id}
			<span class="field-error">{fieldErrors.car_id}</span>
		{/if}
	</div>
	<div class="form-group">
		<label for="team_id">Team</label>
		<select
			id="team_id"
			value={formData.team_id === null ? '' : String(formData.team_id)}
			onchange={(event) => {
				const value = (event.currentTarget as HTMLSelectElement).value;
				formData.team_id = value === '' ? null : Number(value);
			}}
			disabled={isLoading}
			class:input-error={fieldErrors.team_id}
		>
			<option value="">No team</option>
			{#each teamOptions as team (team.team_id)}
				<option value={String(team.team_id)}>{team.name}</option>
			{/each}
		</select>
		{#if fieldErrors.team_id}
			<span class="field-error">{fieldErrors.team_id}</span>
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
