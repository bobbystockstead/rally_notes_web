<script lang="ts">
	interface Props {
		message: string;
		onDismiss?: () => void;
	}

	let { message, onDismiss }: Props = $props();
</script>

/** * Error alert component - displays error messages */

<div class="error-alert">
	<div class="error-icon">⚠️</div>
	<div class="error-content">
		<p>{message}</p>
	</div>
	{#if onDismiss}
		<button class="error-dismiss" onclick={onDismiss} aria-label="Dismiss error">×</button>
	{/if}
</div>

<style>
	.error-alert {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		padding: 1rem;
		background-color: var(--color-error-bg);
		border: 1px solid var(--color-error);
		border-radius: 4px;
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	.error-icon {
		flex-shrink: 0;
		font-size: 1.25rem;
	}

	.error-content {
		flex: 1;
	}

	.error-content p {
		margin: 0;
	}

	.error-dismiss {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--color-error);
		cursor: pointer;
		font-size: 1.5rem;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s;
	}

	.error-dismiss:hover {
		opacity: 0.7;
	}
</style>
