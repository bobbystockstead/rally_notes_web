/**
 * RallyStageMap type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface RallyStageMap {
	rally_stage_id: number;
	rally_id: number;
	stage_id: number;
	stage_order: number | null;
}

export interface RallyStageMapInput {
	rally_id: number;
	stage_id: number;
	stage_order: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
