/**
 * Driver type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Codriver {
	codriver_id: number;
	name: string;
	number: number | null;
}

export interface CodriverInput {
	name: string;
	number: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
