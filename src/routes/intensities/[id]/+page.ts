import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const intensityId = Number.parseInt(params.id, 10);

	if (Number.isNaN(intensityId)) {
		throw error(400, 'Invalid intensity id');
	}

	return {
		intensityId
	};
};
