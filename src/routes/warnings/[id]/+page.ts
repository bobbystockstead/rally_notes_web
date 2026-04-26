import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const warningId = Number.parseInt(params.id, 10);

	if (Number.isNaN(warningId)) {
		throw error(400, 'Invalid warning id');
	}

	return {
		warningId
	};
};
