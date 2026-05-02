<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Tip, TipInput } from '$lib/types/tip';
	import { ApiException } from '$lib/types/tip';
	import { getTip, updateTip, deleteTip } from '$lib/api/tips';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import TipForm from '$lib/components/TipForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let tip: Tip | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let showEditModal = $state(false);
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let fieldErrors = $state({});

	onMount(async () => {
		await fetchTip(data.tipId);
	});

	async function fetchTip(id: number) {
		isLoading = true;
		error = null;

		try {
			tip = await getTip(id);
		} catch (err) {
			if (err instanceof ApiException) {
				if (err.statusCode === 404) {
					error = 'Tip not found';
				} else {
					error = err.message;
				}
			} else {
				error = 'Failed to load tip. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdateTip(data: TipInput) {
		if (!tip) return;

		isSubmitting = true;
		submitError = null;
		fieldErrors = {};

		try {
			await updateTip(tip.tip_id, data);
			tip = { ...tip, ...data };
			showEditModal = false;
		} catch (err) {
			if (err instanceof ApiException) {
				submitError = err.message;
				if (Object.keys(err.fieldErrors).length > 0) {
					fieldErrors = err.fieldErrors;
				}
			} else {
				submitError = 'Failed to update tip. Please try again.';
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteTip() {
		if (!tip) return;

		if (!confirm('Are you sure you want to delete this tip?')) {
			return;
		}

		try {
			await deleteTip(tip.tip_id);
			await goto(resolve('/tips'));
		} catch (err) {
			error = err instanceof ApiException ? err.message : 'Failed to delete tip';
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
	{:else if tip}
		<div class="page-header">
			<div>
				<a href={resolve('/tips')} class="back-link">← Back to Tips</a>
				<h1 class="page-title">{tip.description}</h1>
			</div>
			<div style="display: flex; gap: 0.5rem;">
				<button class="btn btn-primary" onclick={() => (showEditModal = true)}> Edit </button>
				<button class="btn btn-danger" onclick={handleDeleteTip}> Delete </button>
			</div>
		</div>

		<div class="tip-card">
			<div class="tip-field">
				<span class="label">Tip ID</span>
				<p>{tip.tip_id}</p>
			</div>
			<div class="tip-field">
				<span class="label">Description</span>
				<p>{tip.description}</p>
			</div>
		</div>
	{:else}
		<p>Tip not found.</p>
	{/if}

	<Modal
		isOpen={showEditModal}
		title="Edit Tip"
		onClose={() => {
			showEditModal = false;
			submitError = null;
			fieldErrors = {};
		}}
	>
		{#if submitError}
			<ErrorAlert message={submitError} />
		{/if}
		{#if tip}
			<TipForm
				initialData={tip}
				isLoading={isSubmitting}
				{fieldErrors}
				onSubmit={handleUpdateTip}
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

	.tip-card {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 2rem;
	}

	.tip-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.tip-field .label {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0;
	}

	.tip-field p {
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

		.tip-card {
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
