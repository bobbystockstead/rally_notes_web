import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const tipId = Number.parseInt(params.id, 10);

	if (Number.isNaN(tipId)) {
		throw error(400, 'Invalid tip id');
	}

	return {
		tipId
	};
};
