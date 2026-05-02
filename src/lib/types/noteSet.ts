/**
 * NoteSet type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface NoteSet {
	note_id: number;
	crew_id: number;
	name: string;
	stage_id: number;
	conditions: string | null;
}

export interface NoteSetInput {
	crew_id: number;
	name: string;
	stage_id: number;
	conditions: string | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
