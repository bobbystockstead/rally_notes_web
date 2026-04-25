/**
 * Codriver API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Codriver, CodriverInput } from '../types/codriver';
import { createCrudApi } from './client';

const codriversApi = createCrudApi<Codriver, CodriverInput>('/codrivers');

/**
 * Fetch all codrivers
 */
export async function listCodrivers(): Promise<Codriver[]> {
	return codriversApi.list();
}

/**
 * Fetch a single codriver by ID
 */
export async function getCodriver(id: number): Promise<Codriver> {
	return codriversApi.get(id);
}

/**
 * Create a new codriver
 */
export async function createCodriver(input: CodriverInput): Promise<Codriver> {
	return codriversApi.create(input);
}

/**
 * Update an existing codriver
 */
export async function updateCodriver(id: number, input: CodriverInput): Promise<void> {
	return codriversApi.update(id, input);
}

/**
 * Delete a codriver by ID
 */
export async function deleteCodriver(id: number): Promise<void> {
	return codriversApi.remove(id);
}
