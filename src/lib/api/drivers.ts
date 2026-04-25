/**
 * Driver API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Driver, DriverInput } from '../types/driver';
import { createCrudApi } from './client';

const driversApi = createCrudApi<Driver, DriverInput>('/drivers');

/**
 * Fetch all drivers
 */
export async function listDrivers(): Promise<Driver[]> {
	return driversApi.list();
}

/**
 * Fetch a single driver by ID
 */
export async function getDriver(id: number): Promise<Driver> {
	return driversApi.get(id);
}

/**
 * Create a new driver
 */
export async function createDriver(input: DriverInput): Promise<Driver> {
	return driversApi.create(input);
}

/**
 * Update an existing driver
 */
export async function updateDriver(id: number, input: DriverInput): Promise<void> {
	return driversApi.update(id, input);
}

/**
 * Delete a driver by ID
 */
export async function deleteDriver(id: number): Promise<void> {
	return driversApi.remove(id);
}
