<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Team, TeamInput } from '$lib/types/team';
	import type { Manufacturer } from '$lib/types/manufacturer';
	import { ApiException } from '$lib/types/team';
	import { getTeam, updateTeam, deleteTeam } from '$lib/api/teams';
	import { listManufacturers } from '$lib/api/manufacturers';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import TeamForm from '$lib/components/TeamForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let team: Team | null = $state(null);
	let manufacturers: Manufacturer[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	const manufacturerNamesById = $derived(
		Object.fromEntries(
			manufacturers.map((manufacturer) => [manufacturer.manufacturer_id, manufacturer.name])
		)
	);

	const teamManufacturerName = $derived.by(() => {
		const manufacturerId = team?.manufacturer_id;
		if (manufacturerId == null) {
			return null;
		}

		return manufacturerNamesById[manufacturerId] ?? null;
	});

	onMount(async () => {
		await fetchTeam(data.teamId);
	});

	async function fetchTeam(id: number) {
		isLoading = true;
		error = null;

		try {
			const [teamResult, manufacturersResult] = await Promise.all([
				getTeam(id),
				listManufacturers()
			]);
			team = teamResult;
			manufacturers = manufacturersResult;
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Team not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load team. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateTeam(data: TeamInput) {
		if (!team) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateTeam(team.team_id, data);
			team = { ...team, ...data };
			showEditModal = false;
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

	async function handleDeleteTeam() {
		if (!team) return;

		if (!confirm('Are you sure you want to delete this team?')) {
			return;
		}

		try {
			await deleteTeam(team.team_id);
			await goto(resolve('/teams'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete team';
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
	{:else if team}
		<div class="page-header">
			<div>
				<a href={resolve('/teams')} class="back-link">← Back to Teams</a>
				<h1 class="page-title">{team.name}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteTeam}> Delete </button>
			</div>
		</div>

		<div class="team-card">
			<div class="team-field">
				<span class="label">Team ID</span>
				<p>{team.team_id}</p>
			</div>
			<div class="team-field">
				<span class="label">Name</span>
				<p>{team.name}</p>
			</div>
			<div class="team-field">
				<span class="label">Team Manufacturer</span>
				<p>{teamManufacturerName ?? team.manufacturer_id ?? '—'}</p>
			</div>
		</div>
	{:else}
		<p>Team not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Team"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if team}
			<TeamForm
				initialData={team}
				manufacturerOptions={manufacturers}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateTeam}
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

	.team-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.team-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.team-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.team-field p {
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

		.team-card {
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
