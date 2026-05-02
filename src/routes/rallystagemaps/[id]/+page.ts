import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const rallyStageMapId = Number.parseInt(params.id, 10);

	if (Number.isNaN(rallyStageMapId)) {
		throw error(400, 'Invalid rallyStageMap id');
	}

	return {
		rallyStageMapId
	};
};
