/**
 * Rally API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Rally, RallyInput } from '../types/rally';
import { createCrudApi } from './client';

const ralliesApi = createCrudApi<Rally, RallyInput>('/rallies');

/**
 * Fetch all rallies
 */
export async function listRallies(): Promise<Rally[]> {
	return ralliesApi.list();
}

/**
 * Fetch a single rally by ID
 */
export async function getRally(id: number): Promise<Rally> {
	return ralliesApi.get(id);
}

/**
 * Create a new rally
 */
export async function createRally(input: RallyInput): Promise<Rally> {
	return ralliesApi.create(input);
}

/**
 * Update an existing rally
 */
export async function updateRally(id: number, input: RallyInput): Promise<void> {
	return ralliesApi.update(id, input);
}

/**
 * Delete a rally by ID
 */
export async function deleteRally(id: number): Promise<void> {
	return ralliesApi.remove(id);
}
