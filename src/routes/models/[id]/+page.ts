import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const modelId = Number.parseInt(params.id, 10);

	if (Number.isNaN(modelId)) {
		throw error(400, 'Invalid model id');
	}

	return {
		modelId
	};
};
