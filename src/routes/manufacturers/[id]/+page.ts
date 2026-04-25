import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const manufacturerId = Number.parseInt(params.id, 10);

	if (Number.isNaN(manufacturerId)) {
		throw error(400, 'Invalid manufacturer id');
	}

	return {
		manufacturerId
	};
};
