/**
 * RallyStageMap API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { RallyStageMap, RallyStageMapInput } from '../types/rallyStageMap';
import { createCrudApi } from './client';

const rallyStageMapsApi = createCrudApi<RallyStageMap, RallyStageMapInput>('/rallyStageMaps');

/**
 * Fetch all RallyStageMaps
 */
export async function listRallyStageMaps(): Promise<RallyStageMap[]> {
	return rallyStageMapsApi.list();
}

/**
 * Fetch a single RallyStageMap by ID
 */
export async function getRallyStageMap(id: number): Promise<RallyStageMap> {
	return rallyStageMapsApi.get(id);
}

/**
 * Create a new RallyStageMap
 */
export async function createRallyStageMap(input: RallyStageMapInput): Promise<RallyStageMap> {
	return rallyStageMapsApi.create(input);
}

/**
 * Update an existing RallyStageMap
 */
export async function updateRallyStageMap(id: number, input: RallyStageMapInput): Promise<void> {
	return rallyStageMapsApi.update(id, input);
}

/**
 * Delete a RallyStageMap by ID
 */
export async function deleteRallyStageMap(id: number): Promise<void> {
	return rallyStageMapsApi.remove(id);
}
