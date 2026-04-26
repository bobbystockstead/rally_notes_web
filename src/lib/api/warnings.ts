/**
 * Warning API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Warning, WarningInput } from '../types/warning';
import { createCrudApi } from './client';

const warningsApi = createCrudApi<Warning, WarningInput>('/warnings');

/**
 * Fetch all warnings
 */
export async function listWarnings(): Promise<Warning[]> {
	return warningsApi.list();
}

/**
 * Fetch a single warning by ID
 */
export async function getWarning(id: number): Promise<Warning> {
	return warningsApi.get(id);
}

/**
 * Create a new warning
 */
export async function createWarning(input: WarningInput): Promise<Warning> {
	return warningsApi.create(input);
}

/**
 * Update an existing warning
 */
export async function updateWarning(id: number, input: WarningInput): Promise<void> {
	return warningsApi.update(id, input);
}

/**
 * Delete a warning by ID
 */
export async function deleteWarning(id: number): Promise<void> {
	return warningsApi.remove(id);
}
