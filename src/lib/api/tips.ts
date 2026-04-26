/**
 * Tip API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Tip, TipInput } from '../types/tip';
import { createCrudApi } from './client';

const tipsApi = createCrudApi<Tip, TipInput>('/tips');

/**
 * Fetch all tips
 */
export async function listTips(): Promise<Tip[]> {
	return tipsApi.list();
}

/**
 * Fetch a single tip by ID
 */
export async function getTip(id: number): Promise<Tip> {
	return tipsApi.get(id);
}

/**
 * Create a new tip
 */
export async function createTip(input: TipInput): Promise<Tip> {
	return tipsApi.create(input);
}

/**
 * Update an existing tip
 */
export async function updateTip(id: number, input: TipInput): Promise<void> {
	return tipsApi.update(id, input);
}

/**
 * Delete a tip by ID
 */
export async function deleteTip(id: number): Promise<void> {
	return tipsApi.remove(id);
}
