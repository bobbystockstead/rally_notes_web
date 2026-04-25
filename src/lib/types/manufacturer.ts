/**
 * Manufacturer type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Manufacturer {
	manufacturer_id: number;
	name: string;
}

export interface ManufacturerInput {
	name: string;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
