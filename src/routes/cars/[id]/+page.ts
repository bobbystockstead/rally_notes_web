import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const carId = Number.parseInt(params.id, 10);

	if (Number.isNaN(carId)) {
		throw error(400, 'Invalid car id');
	}

	return {
		carId
	};
};
