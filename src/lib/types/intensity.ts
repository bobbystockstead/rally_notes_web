/**
 * Intensities type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Intensity {
	intensity_id: number;
	name: string;
}

export interface IntensityInput {
	name: string;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
