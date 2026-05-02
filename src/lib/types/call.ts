/**
 * Call type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Call {
	call_id: number;
	note_id: number;
	sequence_number: number;
	gear: number | null;
	direction: string | null;
	distance: number | null;
	intensity_id: number | null;
	warning_id: number | null;
	tip_id: number | null;
}

export interface CallInput {
	note_id: number;
	sequence_number: number;
	gear: number | null;
	direction: string | null;
	distance: number | null;
	intensity_id: number | null;
	warning_id: number | null;
	tip_id: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
