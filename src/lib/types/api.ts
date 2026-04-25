/**
 * Shared API types aligned with ValidationErrorResponse in api_swagger.yaml
 */

export interface ValidationIssue {
	field: string;
	message: string;
}

export interface ValidationErrorResponse {
	error?: string;
	details: ValidationIssue[];
}

export type FieldErrors = Record<string, string>;

export class ApiException extends Error {
	statusCode: number;
	fieldErrors: FieldErrors;

	constructor(message: string, statusCode: number, fieldErrors: FieldErrors = {}) {
		super(message);
		this.name = 'ApiException';
		this.statusCode = statusCode;
		this.fieldErrors = fieldErrors;
	}
}
