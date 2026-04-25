<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to drivers list on app load
		void goto(resolve('/drivers')).catch(() => {
			// Ignore cancelled navigation during startup lifecycle.
		});
	});
</script>

<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
	<p>Loading...</p>
</div>
