import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const teamId = Number.parseInt(params.id, 10);

	if (Number.isNaN(teamId)) {
		throw error(400, 'Invalid team id');
	}

	return {
		teamId
	};
};
