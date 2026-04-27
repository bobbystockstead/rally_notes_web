/**
 * Crew type definitions matching the Ktor backend schema
 */

import type { ValidationIssue, ValidationErrorResponse as ApiError, FieldErrors } from './api';
export { ApiException } from './api';

export interface Crew {
	crew_id: number;
	driver_id: number;
	codriver_id: number;
	car_id: number | null;
	team_id: number | null;
}

export interface CrewInput {
	driver_id: number;
	codriver_id: number;
	car_id: number | null;
	team_id: number | null;
}

export type ValidationError = ValidationIssue;
export type { ApiError, FieldErrors };
