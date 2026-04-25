<script lang="ts">
	import appIcon from '$lib/assets/rally_icon_2.svg';
	import { resolve } from '$app/paths';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={appIcon} />
</svelte:head>

<header class="app-header">
	<div class="app-header-inner">
		<a href={resolve('/')} class="app-home-link" aria-label="Go to home">
			<img src={appIcon} alt="Rally Notes" class="app-home-icon" />
		</a>
	</div>
</header>

<main class="app-main">{@render children()}</main>

<style>
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--color-bg) 92%, white);
		backdrop-filter: blur(4px);
		border-bottom: 1px solid var(--color-border);
	}

	.app-header-inner {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.75rem 1rem;
	}

	.app-home-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		border-radius: 999px;
		padding: 0.25rem;
	}

	.app-home-icon {
		height: 42px;
		width: 42px;
		display: block;
	}

	.app-main {
		padding-top: 0.5rem;
	}
</style>
