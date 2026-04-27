/**
 * Car API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Car, CarInput } from '../types/car';
import { createCrudApi } from './client';

const carsApi = createCrudApi<Car, CarInput>('/cars');

/**
 * Fetch all cars
 */
export async function listCars(): Promise<Car[]> {
	return carsApi.list();
}

/**
 * Fetch a single car by ID
 */
export async function getCar(id: number): Promise<Car> {
	return carsApi.get(id);
}

/**
 * Create a new car
 */
export async function createCar(input: CarInput): Promise<Car> {
	return carsApi.create(input);
}

/**
 * Update an existing car
 */
export async function updateCar(id: number, input: CarInput): Promise<void> {
	return carsApi.update(id, input);
}

/**
 * Delete a car by ID
 */
export async function deleteCar(id: number): Promise<void> {
	return carsApi.remove(id);
}
