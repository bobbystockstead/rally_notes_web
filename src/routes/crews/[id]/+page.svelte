<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Crew, CrewInput } from '$lib/types/crew';
	import type { Driver } from '$lib/types/driver';
	import type { Codriver } from '$lib/types/codriver';
	import type { Car } from '$lib/types/car';
	import type { Team } from '$lib/types/team';
	import { ApiException } from '$lib/types/crew';
	import { getCrew, updateCrew, deleteCrew } from '$lib/api/crews';
	import { listDrivers } from '$lib/api/drivers';
	import { listCodrivers } from '$lib/api/codrivers';
	import { listCars } from '$lib/api/cars';
	import { listTeams } from '$lib/api/teams';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CrewForm from '$lib/components/CrewForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let crew: Crew | null = $state(null);
	let drivers: Driver[] = $state([]);
	let codrivers: Codriver[] = $state([]);
	let cars: Car[] = $state([]);
	let teams: Team[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const driverNamesById = $derived(
		Object.fromEntries(drivers.map((driver) => [driver.driver_id, driver.name]))
	);
	const codriverNamesById = $derived(
		Object.fromEntries(codrivers.map((codriver) => [codriver.codriver_id, codriver.name]))
	);
	const carNamesById = $derived(Object.fromEntries(cars.map((car) => [car.car_id, car.name])));
	const teamNamesById = $derived(
		Object.fromEntries(teams.map((team) => [team.team_id, team.name]))
	);

	const crewDriverName = $derived.by(() => {
		const driverId = crew?.driver_id;
		if (driverId == null) {
			return null;
		}

		return driverNamesById[driverId] ?? null;
	});
	const crewCodriverName = $derived.by(() => {
		const codriverId = crew?.codriver_id;
		if (codriverId == null) {
			return null;
		}

		return codriverNamesById[codriverId] ?? null;
	});
	const crewCarName = $derived.by(() => {
		const carId = crew?.car_id;
		if (carId == null) {
			return null;
		}

		return carNamesById[carId] ?? null;
	});
	const crewTeamName = $derived.by(() => {
		const teamId = crew?.team_id;
		if (teamId == null) {
			return null;
		}

		return teamNamesById[teamId] ?? null;
	});

	onMount(async () => {
		await fetchCrew(data.crewId);
	});

	async function fetchCrew(id: number) {
		isLoading = true;
		error = null;

		try {
			const [crewResult, driversResult, codriversResult, carsResult, teamsResult] =
				await Promise.all([getCrew(id), listDrivers(), listCodrivers(), listCars(), listTeams()]);
			crew = crewResult;
			drivers = driversResult;
			codrivers = codriversResult;
			cars = carsResult;
			teams = teamsResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Crew not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load crew. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateCrew(data: CrewInput) {
		if (!crew) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateCrew(crew.crew_id, data);
			crew = { ...crew, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update crew. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteCrew() {
		if (!crew) return;

		if (!confirm('Are you sure you want to delete this crew?')) {
			return;
		}

		try {
			await deleteCrew(crew.crew_id);
			await goto(resolve('/crews'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete crew';
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
	{:else if crew}
		<div class="page-header">
			<div>
				<a href={resolve('/crews')} class="back-link">← Back to Crews</a>
				<h1 class="page-title">{crew.crew_id} {crewDriverName}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteCrew}> Delete </button>
			</div>
		</div>

		<div class="crew-card">
			<div class="crew-field">
				<span class="label">Crew ID</span>
				<p>{crew.crew_id}</p>
			</div>
			<div class="crew-field">
				<span class="label">Crew Driver</span>
				<p>{crewDriverName ?? crew.driver_id}</p>
			</div>
			<div class="crew-field">
				<span class="label">Crew Codriver</span>
				<p>{crewCodriverName ?? crew.codriver_id}</p>
			</div>
			<div class="crew-field">
				<span class="label">Crew Car</span>
				<p>{crewCarName ?? crew.car_id ?? '—'}</p>
			</div>
			<div class="crew-field">
				<span class="label">Crew Team</span>
				<p>{crewTeamName ?? crew.team_id ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Crew not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Crew"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if crew}
			<CrewForm
				initialData={crew}
				driverOptions={drivers}
				codriverOptions={codrivers}
				carOptions={cars}
				teamOptions={teams}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCrew}
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

	.crew-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.crew-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.crew-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.crew-field p {
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

		.crew-card {
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
