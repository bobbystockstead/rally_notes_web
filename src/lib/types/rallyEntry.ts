/**
 * RallyEntry type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface RallyEntry {
	entry_id: number;
	rally_id: number;
	crew_id: number;
	car_number: number | null;
}

export interface RallyEntryInput {
	rally_id: number;
	crew_id: number;
	car_number: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
