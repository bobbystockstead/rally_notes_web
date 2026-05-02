/**
 * Call API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Call, CallInput } from '../types/call';
import { createCrudApi } from './client';

const callsApi = createCrudApi<Call, CallInput>('/calls');

/**
 * Fetch all note sets
 */
export async function listCalls(): Promise<Call[]> {
	return callsApi.list();
}

/**
 * Fetch a single note sets by ID
 */
export async function getCall(id: number): Promise<Call> {
	return callsApi.get(id);
}

/**
 * Create a new note set
 */
export async function createCall(input: CallInput): Promise<Call> {
	return callsApi.create(input);
}

/**
 * Update an existing note set
 */
export async function updateCall(id: number, input: CallInput): Promise<void> {
	return callsApi.update(id, input);
}

/**
 * Delete a note set by ID
 */
export async function deleteCall(id: number): Promise<void> {
	return callsApi.remove(id);
}
