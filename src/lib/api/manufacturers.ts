/**
 * Manufacturer API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Manufacturer, ManufacturerInput } from '../types/manufacturer';
import { createCrudApi } from './client';

const manufacturersApi = createCrudApi<Manufacturer, ManufacturerInput>('/manufacturers');

/**
 * Fetch all manufacturers
 */
export async function listManufacturers(): Promise<Manufacturer[]> {
	return manufacturersApi.list();
}

/**
 * Fetch a single manufacturer by ID
 */
export async function getManufacturer(id: number): Promise<Manufacturer> {
	return manufacturersApi.get(id);
}

/**
 * Create a new manufacturer
 */
export async function createManufacturer(input: ManufacturerInput): Promise<Manufacturer> {
	return manufacturersApi.create(input);
}

/**
 * Update an existing manufacturer
 */
export async function updateManufacturer(id: number, input: ManufacturerInput): Promise<void> {
	return manufacturersApi.update(id, input);
}

/**
 * Delete a manufacturer by ID
 */
export async function deleteManufacturer(id: number): Promise<void> {
	return manufacturersApi.remove(id);
}
