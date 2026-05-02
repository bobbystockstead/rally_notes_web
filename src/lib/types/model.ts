/**
 * Model type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Model {
	model_id: number;
	name: string;
	manufacturer_id: number;
}

export interface ModelInput {
	name: string;
	manufacturer_id: number;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
