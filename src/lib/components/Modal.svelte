<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen: boolean;
		title?: string;
		onClose: () => void;
		children?: Snippet;
	}

	let { isOpen = false, title, onClose, children }: Props = $props();

	function handleDialogClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

/** * Modal component - reusable modal container with backdrop */
{#if isOpen}
	<dialog open class="modal-backdrop" onclick={handleDialogClick}>
		<div class="modal-content">
			{#if title}
				<div class="modal-header">
					<h2>{title}</h2>
					<button class="modal-close" onclick={onClose} aria-label="Close modal">×</button>
				</div>
			{/if}
			<div class="modal-body">
				{@render children?.()}
			</div>
		</div>
	</dialog>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		animation: fadeIn 0.2s ease-in-out;
	}

	.modal-content {
		background-color: var(--color-bg);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		animation: slideUp 0.3s ease-out;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-text);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 2rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.modal-close:hover {
		background-color: var(--color-border);
	}

	.modal-body {
		padding: 1.5rem;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
