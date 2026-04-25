/**
 * Driver type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Driver {
	driver_id: number;
	name: string;
	number: number | null;
}

export interface DriverInput {
	name: string;
	number: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
