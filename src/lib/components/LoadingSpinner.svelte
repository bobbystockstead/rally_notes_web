<script lang="ts">
	interface Props {
		size?: 'small' | 'medium' | 'large';
	}

	let { size = 'medium' }: Props = $props();
</script>

<div class="spinner spinner-{size}" role="status" aria-label="Loading">
	<span class="visually-hidden">Loading...</span>
</div>

<style>
	.spinner {
		display: inline-block;
		border: 3px solid var(--color-border);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.spinner-small {
		width: 16px;
		height: 16px;
	}

	.spinner-medium {
		width: 32px;
		height: 32px;
	}

	.spinner-large {
		width: 48px;
		height: 48px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
