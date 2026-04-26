/**
 * Stage API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Stage, StageInput } from '../types/stage';
import { createCrudApi } from './client';

const stagesApi = createCrudApi<Stage, StageInput>('/stages');

/**
 * Fetch all stages
 */
export async function listStages(): Promise<Stage[]> {
	return stagesApi.list();
}

/**
 * Fetch a single stage by ID
 */
export async function getStage(id: number): Promise<Stage> {
	return stagesApi.get(id);
}

/**
 * Create a new stage
 */
export async function createStage(input: StageInput): Promise<Stage> {
	return stagesApi.create(input);
}

/**
 * Update an existing stage
 */
export async function updateStage(id: number, input: StageInput): Promise<void> {
	return stagesApi.update(id, input);
}

/**
 * Delete a stage by ID
 */
export async function deleteStage(id: number): Promise<void> {
	return stagesApi.remove(id);
}
