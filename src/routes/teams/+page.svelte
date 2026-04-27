<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Team, TeamInput } from '$lib/types/team';
	import type { Manufacturer } from '$lib/types/manufacturer';
	import { ApiException } from '$lib/types/team';
	import { listTeams, createTeam, updateTeam, deleteTeam } from '$lib/api/teams';
	import { listManufacturers } from '$lib/api/manufacturers';
	import type { FieldErrors } from '$lib/types/api';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import TeamForm from '$lib/components/TeamForm.svelte';

	let teams: Team[] = $state([]);
	let manufacturers: Manufacturer[] = $state([]);
	let manufacturerNamesById = $state<Record<number, string>>({});
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let editingTeam: Team | null = $state(null);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state<FieldErrors>({});

	onMount(async () => {
		await fetchTeams();
	});

	async function fetchTeams() {
		isLoading = true;
		error = null;

		try {
			const [teamsResult, manufacturersResult] = await Promise.all([
				listTeams(),
				listManufacturers()
			]);
			teams = teamsResult;
			manufacturers = manufacturersResult;
			manufacturerNamesById = Object.fromEntries(
				manufacturersResult.map((manufacturer) => [manufacturer.manufacturer_id, manufacturer.name])
			);
		} catch (err) {
			if (err instanceof ApiException) {
				error = err.message;
			} else {
				error = 'Failed to load teams. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateTeam(data: TeamInput) {
		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const newTeam = await createTeam(data);
			teams = [...teams, newTeam];
			showCreateModal = false;
			// Navigate to the newly created team's detail page
			await goto(resolve('/teams/[id]', { id: String(newTeam.team_id) }));
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to create team. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	function openEditModal(team: Team) {
		editingTeam = team;
		showEditModal = true;
		submitError = null;
		fieldErrors = {};
	}

	function closeEditModal() {
		showEditModal = false;
		editingTeam = null;
		submitError = null;
		fieldErrors = {};
	}

	async function handleUpdateTeam(data: TeamInput) {
		if (!editingTeam) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			const editingTeamId = editingTeam.team_id;
			await updateTeam(editingTeamId, data);
			teams = teams.map((team) => (team.team_id === editingTeamId ? { ...team, ...data } : team));
			closeEditModal();
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update team. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteTeam(id: number) {
		if (!confirm('Are you sure you want to delete this team?')) {
			return;
		}

		try {
			await deleteTeam(id);
			teams = teams.filter((d) => d.team_id !== id);
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete team';
		}
	}
</script>

<div class="container">
	<div class="page-header">
		<h1 class="page-title">Teams</h1>
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}> + New Team </button>
	</div>

	{#if error}
		<ErrorAlert message={error} onDismiss={() => (error = null)} />
	{/if}

	{#if isLoading}
		<div style="display: flex; justify-content: center; padding: 2rem;">
			<LoadingSpinner size="large" />
		</div>
	{:else if teams.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">🏁</div>
			<h3>No teams yet</h3>
			<p>Create your first team to get started managing rally racing teams.</p>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				Create First Team
			</button>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Manufacturer</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each teams as team (team.team_id)}
						<tr>
							<td>{team.team_id}</td>
							<td>{team.name}</td>
							<td>
								{team.manufacturer_id === null
									? '—'
									: (manufacturerNamesById[team.manufacturer_id] ?? `ID ${team.manufacturer_id}`)}
							</td>
							<td>
								<div class="action-buttons">
									<a
										href={resolve('/teams/[id]', { id: String(team.team_id) })}
										class="btn btn-sm btn-primary"
									>
										View
									</a>
									<button class="btn btn-sm btn-secondary" onclick={() => openEditModal(team)}>
										Edit
									</button>
									<button
										class="btn btn-sm btn-danger"
										onclick={() => handleDeleteTeam(team.team_id)}
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
		title="Create New Team"
		onClose={() => {
			showCreateModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		<TeamForm
			manufacturerOptions={manufacturers}
			isLoading={isSubmitting}
			{fieldErrors}
			onSubmit={handleCreateTeam}
			onCancel={() => {
				showCreateModal = false;
				submitError = null;
				fieldErrors = {};
			}}
		/>
	</Modal>

	<Modal isOpen={showEditModal} title="Edit Team" onClose={closeEditModal}>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if editingTeam}
			<TeamForm
				initialData={editingTeam}
				manufacturerOptions={manufacturers}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateTeam}
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
