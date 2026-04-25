import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const driverId = Number.parseInt(params.id, 10);

	if (Number.isNaN(driverId)) {
		throw error(400, 'Invalid driver id');
	}

	return {
		driverId
	};
};
