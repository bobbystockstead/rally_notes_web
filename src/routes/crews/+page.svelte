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
	import { listCrews, createCrew, updateCrew, deleteCrew } from '$lib/api/crews';
	import { listDrivers } from '$lib/api/drivers';
	import { listCodrivers } from '$lib/api/codrivers';
	import { listCars } from '$lib/api/cars';
	import { listTeams } from '$lib/api/teams';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import CrewForm from '$lib/components/CrewForm.svelte';

	let crews: Crew[] = $state([]);
	let drivers: Driver[] = $state([]);
	let codrivers: Codriver[] = $state([]);
	let cars: Car[] = $state([]);
	let teams: Team[] = $state([]);
	let driverNamesById = $state<Record<number, string>>({});
	let codriverNamesById = $state<Record<number, string>>({});
	let carNamesById = $state<Record<number, string>>({});
	let teamNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingCrew: Crew | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchCrews();
	});

	async function fetchCrews() {
		isLoading = true;
		error = null;

		try {
			const [crewsResult, driversResult, codriversResult, carsResult, teamsResult] =
				await Promise.all([listCrews(), listDrivers(), listCodrivers(), listCars(), listTeams()]);
			crews = crewsResult;
			drivers = driversResult;
			codrivers = codriversResult;
			cars = carsResult;
			teams = teamsResult;
			driverNamesById = Object.fromEntries(
				driversResult.map((driver) => [driver.driver_id, driver.name])
			);
			codriverNamesById = Object.fromEntries(
				codriversResult.map((codriver) => [codriver.codriver_id, codriver.name])
			);
			carNamesById = Object.fromEntries(carsResult.map((car) => [car.car_id, car.name]));
			teamNamesById = Object.fromEntries(teamsResult.map((team) => [team.team_id, team.name]));
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load crews. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateCrew(data: CrewInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newCrew = await createCrew(data);
			crews = [...crews, newCrew];
			showCreateModal = false;
			// Navigate to the newly created crew's detail page
			await goto(resolve('/crews/[id]', { id: String(newCrew.crew_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create crew. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(crew: Crew) {
		editingCrew = crew;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingCrew = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateCrew(data: CrewInput) {
		if (!editingCrew) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingCrewId = editingCrew.crew_id;
			await updateCrew(editingCrewId, data);
			crews = crews.map((crew) => (crew.crew_id === editingCrewId ? { ...crew, ...data } : crew));
			closeEditModal();
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

	async function handleDeleteCrew(id: number) {
		if (!confirm('Are you sure you want to delete this crew?')) {
			return;
		}

		try {
			await deleteCrew(id);
			crews = crews.filter((d) => d.crew_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete crew';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Crews</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Crew </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if crews.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No crews yet</h3>
			<p>Create your first crew to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Crew
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Driver</th>
						<th>Codriver</th>
						<th>Car</th>
						<th>Team</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each crews as crew (crew.crew_id)}
						<tr>
							<td>{crew.crew_id}</td>
							<td>{driverNamesById[crew.driver_id] ?? `ID ${crew.driver_id}`}</td>
							<td>{codriverNamesById[crew.codriver_id] ?? `ID ${crew.codriver_id}`}</td>
							<td>
								{crew.car_id === null ? '—' : (carNamesById[crew.car_id] ?? `ID ${crew.car_id}`)}
							</td>
							<td>
								{crew.team_id === null
									? '—'
									: (teamNamesById[crew.team_id] ?? `ID ${crew.team_id}`)}
							</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/crews/[id]', { id: String(crew.crew_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(crew)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteCrew(crew.crew_id)}
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
		title="Create New Crew"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<CrewForm
			driverOptions={drivers}
			codriverOptions={codrivers}
			carOptions={cars}
			teamOptions={teams}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateCrew}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Crew" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingCrew}
			<CrewForm
				initialData={editingCrew}
				driverOptions={drivers}
				codriverOptions={codrivers}
				carOptions={cars}
				teamOptions={teams}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateCrew}
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
