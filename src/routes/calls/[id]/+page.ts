import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const callId = Number.parseInt(params.id, 10);

	if (Number.isNaN(callId)) {
		throw error(400, 'Invalid call id');
	}

	return {
		callId: callId
	};
};
