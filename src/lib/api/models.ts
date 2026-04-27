/**
 * Model API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Model, ModelInput } from '../types/model';
import { createCrudApi } from './client';

const modelsApi = createCrudApi<Model, ModelInput>('/models');

/**
 * Fetch all models
 */
export async function listModels(): Promise<Model[]> {
	return modelsApi.list();
}

/**
 * Fetch a single model by ID
 */
export async function getModel(id: number): Promise<Model> {
	return modelsApi.get(id);
}

/**
 * Create a new model
 */
export async function createModel(input: ModelInput): Promise<Model> {
	return modelsApi.create(input);
}

/**
 * Update an existing model
 */
export async function updateModel(id: number, input: ModelInput): Promise<void> {
	return modelsApi.update(id, input);
}

/**
 * Delete a model by ID
 */
export async function deleteModel(id: number): Promise<void> {
	return modelsApi.remove(id);
}
