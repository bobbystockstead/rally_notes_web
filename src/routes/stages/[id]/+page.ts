import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const stageId = Number.parseInt(params.id, 10);

	if (Number.isNaN(stageId)) {
		throw error(400, 'Invalid stage id');
	}

	return {
		stageId
	};
};
