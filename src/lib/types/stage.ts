/**
 * Stage type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Stage {
	stage_id: number;
	name: string;
	distance: number | null;
}

export interface StageInput {
	name: string;
	distance: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
