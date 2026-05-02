import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const rallyEntryId = Number.parseInt(params.id, 10);

	if (Number.isNaN(rallyEntryId)) {
		throw error(400, 'Invalid rallyEntry id');
	}

	return {
		rallyEntryId
	};
};
