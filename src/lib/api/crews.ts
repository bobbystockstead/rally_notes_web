/**
 * Crew API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Crew, CrewInput } from '../types/crew';
import { createCrudApi } from './client';

const crewsApi = createCrudApi<Crew, CrewInput>('/crews');

/**
 * Fetch all crews
 */
export async function listCrews(): Promise<Crew[]> {
	return crewsApi.list();
}

/**
 * Fetch a single crew by ID
 */
export async function getCrew(id: number): Promise<Crew> {
	return crewsApi.get(id);
}

/**
 * Create a new crew
 */
export async function createCrew(input: CrewInput): Promise<Crew> {
	return crewsApi.create(input);
}

/**
 * Update an existing crew
 */
export async function updateCrew(id: number, input: CrewInput): Promise<void> {
	return crewsApi.update(id, input);
}

/**
 * Delete a crew by ID
 */
export async function deleteCrew(id: number): Promise<void> {
	return crewsApi.remove(id);
}
