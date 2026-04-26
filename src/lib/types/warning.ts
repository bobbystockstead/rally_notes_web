/**
 * Warning type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Warning {
	warning_id: number;
	description: string;
}

export interface WarningInput {
	description: string;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
