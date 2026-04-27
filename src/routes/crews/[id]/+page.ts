import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const crewId = Number.parseInt(params.id, 10);

	if (Number.isNaN(crewId)) {
		throw error(400, 'Invalid crew id');
	}

	return {
		crewId
	};
};
