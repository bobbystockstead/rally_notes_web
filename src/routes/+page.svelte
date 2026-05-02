<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import rallyIcon from '$lib/assets/rally_icon_2.svg';

	type ResourceLink = {
		label: string;
		path?:
			| '/cars'
			| '/codrivers'
			| '/crews'
			| '/drivers'
			| '/intensities'
			| '/manufacturers'
			| '/models'
			| '/rallies'
			| '/rallyentries'
			| '/rallystagemaps'
			| '/stages'
			| '/teams'
			| '/tips'
			| '/warnings';
		description: string;
		enabled: boolean;
	};

	const resources: ResourceLink[] = [
		{
			label: 'Cars',
			path: '/cars',
			description: 'Manage car records',
			enabled: true
		},
		{
			label: 'Codrivers',
			path: '/codrivers',
			description: 'Manage codriver records',
			enabled: true
		},
		{
			label: 'Crews',
			path: '/crews',
			description: 'Manage crew records',
			enabled: true
		},
		{
			label: 'Drivers',
			path: '/drivers',
			description: 'Manage driver records',
			enabled: true
		},
		{
			label: 'Intensities',
			path: '/intensities',
			description: 'Manage intensity records',
			enabled: true
		},
		{
			label: 'Manufacturers',
			path: '/manufacturers',
			description: 'Manage manufacturer records',
			enabled: true
		},
		{
			label: 'Models',
			path: '/models',
			description: 'Manage model records',
			enabled: true
		},
		{
			label: 'Rallies',
			path: '/rallies',
			description: 'Manage rally records',
			enabled: true
		},
		{
			label: 'Rally Entries',
			path: '/rallyentries',
			description: 'Manage rallyEntry records',
			enabled: true
		},
		{
			label: 'Rally Stage Maps',
			path: '/rallystagemaps',
			description: 'Manage rallyStageMap records',
			enabled: true
		},
		{
			label: 'Stages',
			path: '/stages',
			description: 'Manage stage records',
			enabled: true
		},
		{
			label: 'Teams',
			path: '/teams',
			description: 'Manage team records',
			enabled: true
		},
		{
			label: 'Tips',
			path: '/tips',
			description: 'Manage tip records',
			enabled: true
		},
		{
			label: 'Warnings',
			path: '/warnings',
			description: 'Manage warning records',
			enabled: true
		}
	];

	function openResource(resource: ResourceLink) {
		if (!resource.enabled || !resource.path) {
			return;
		}

		void goto(resolve(resource.path)).catch(() => {
			// Ignore cancelled navigation from rapid clicks.
		});
	}
</script>

<div class="home-shell container">
	<img class="home-logo" src={rallyIcon} alt="Rally Notes" />
	<h1 class="home-title">Rally Notes Resources</h1>
	<p class="home-subtitle">
		Choose a resource to view and edit. Enable more as you build CRUD pages.
	</p>

	<div class="resource-list" role="list">
		{#each resources as resource (resource.label)}
			<button
				type="button"
				class="resource-button"
				disabled={!resource.enabled}
				onclick={() => openResource(resource)}
				aria-label={`Open ${resource.label}`}
			>
				<span class="resource-name">{resource.label}</span>
				<span class="resource-description">{resource.description}</span>
				{#if !resource.enabled}
					<span class="resource-soon">Coming soon</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.home-shell {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 2rem;
		padding-bottom: 2rem;
		text-align: center;
	}

	.home-logo {
		width: 96px;
		height: 96px;
		margin-bottom: 1rem;
	}

	.home-title {
		margin-bottom: 0.5rem;
	}

	.home-subtitle {
		max-width: 680px;
		margin-bottom: 1.5rem;
		color: var(--color-text-secondary);
	}

	.resource-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
		width: 100%;
		max-width: 900px;
	}

	.resource-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 0.9rem 1rem;
		background: var(--color-bg-secondary);
		cursor: pointer;
		text-align: left;
		transition:
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.resource-button:hover:enabled {
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.resource-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.resource-name {
		font-weight: 700;
		color: var(--color-text);
	}

	.resource-description {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.resource-soon {
		margin-top: 0.15rem;
		font-size: 0.8rem;
		color: var(--color-warning);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.home-shell {
			padding-top: 1.5rem;
		}

		.home-logo {
			width: 80px;
			height: 80px;
		}
	}
</style>
