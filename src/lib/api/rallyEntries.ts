/**
 * RallyEntry API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { RallyEntry, RallyEntryInput } from '../types/rallyEntry';
import { createCrudApi } from './client';

const rallyEntriesApi = createCrudApi<RallyEntry, RallyEntryInput>('/rallyEntries');

/**
 * Fetch all rallyEntries
 */
export async function listRallyEntries(): Promise<RallyEntry[]> {
	return rallyEntriesApi.list();
}

/**
 * Fetch a single rallyentry by ID
 */
export async function getRallyEntry(id: number): Promise<RallyEntry> {
	return rallyEntriesApi.get(id);
}

/**
 * Create a new rallyentry
 */
export async function createRallyEntry(input: RallyEntryInput): Promise<RallyEntry> {
	return rallyEntriesApi.create(input);
}

/**
 * Update an existing rallyentry
 */
export async function updateRallyEntry(id: number, input: RallyEntryInput): Promise<void> {
	return rallyEntriesApi.update(id, input);
}

/**
 * Delete a rallyentry by ID
 */
export async function deleteRallyEntry(id: number): Promise<void> {
	return rallyEntriesApi.remove(id);
}
