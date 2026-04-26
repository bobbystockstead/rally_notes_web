import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const rallyId = Number.parseInt(params.id, 10);

	if (Number.isNaN(rallyId)) {
		throw error(400, 'Invalid rally id');
	}

	return {
		rallyId
	};
};
