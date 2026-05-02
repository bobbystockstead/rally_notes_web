import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const noteSetId = Number.parseInt(params.id, 10);

	if (Number.isNaN(noteSetId)) {
		throw error(400, 'Invalid note set id');
	}

	return {
		noteSetId: noteSetId
	};
};
