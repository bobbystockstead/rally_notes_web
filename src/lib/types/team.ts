/**
 * Team type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Team {
	team_id: number;
	name: string;
	manufacturer_id: number | null;
}

export interface TeamInput {
	name: string;
	manufacturer_id: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
