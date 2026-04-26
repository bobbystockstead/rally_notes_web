/**
 * Intensity API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Intensity, IntensityInput } from '../types/intensity';
import { createCrudApi } from './client';

const intensitiesApi = createCrudApi<Intensity, IntensityInput>('/intensities');

/**
 * Fetch all intensities
 */
export async function listIntensities(): Promise<Intensity[]> {
	return intensitiesApi.list();
}

/**
 * Fetch a single intensity by ID
 */
export async function getIntensity(id: number): Promise<Intensity> {
	return intensitiesApi.get(id);
}

/**
 * Create a new intensity
 */
export async function createIntensity(input: IntensityInput): Promise<Intensity> {
	return intensitiesApi.create(input);
}

/**
 * Update an existing intensity
 */
export async function updateIntensity(id: number, input: IntensityInput): Promise<void> {
	return intensitiesApi.update(id, input);
}

/**
 * Delete a intensity by ID
 */
export async function deleteIntensity(id: number): Promise<void> {
	return intensitiesApi.remove(id);
}
