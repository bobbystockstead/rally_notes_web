/**
 * Rally type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Rally {
	rally_id: number;
	name: string;
	date: Date | null;
}

export interface RallyInput {
	name: string;
	date: Date | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
