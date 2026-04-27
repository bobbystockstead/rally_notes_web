/**
 * Car type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Car {
	car_id: number;
	name: string;
	model_id: number | null;
}

export interface CarInput {
	name: string;
	model_id: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
