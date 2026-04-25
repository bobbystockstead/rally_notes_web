/**
 * Shared API client for browser-side resource modules.
 */

import { env } from '$env/dynamic/public';
import { ApiException, type FieldErrors, type ValidationErrorResponse } from '$lib/types/api';

const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = env.PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

function isValidationErrorResponse(value: unknown): value is ValidationErrorResponse {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const details = (value as ValidationErrorResponse).details;
	return Array.isArray(details);
}

function toFieldErrors(errorResponse: ValidationErrorResponse): FieldErrors {
	const fieldErrors: FieldErrors = {};

	for (const issue of errorResponse.details) {
		if (issue.field && issue.message) {
			fieldErrors[issue.field] = issue.message;
		}
	}

	return fieldErrors;
}

async function parseResponse<T>(response: Response): Promise<T> {
	if (response.status === 204) {
		return undefined as T;
	}

	let payload: unknown = null;
	const contentType = response.headers.get('content-type') || '';

	if (contentType.includes('application/json')) {
		try {
			payload = await response.json();
		} catch {
			payload = null;
		}
	}

	if (!response.ok) {
		if (isValidationErrorResponse(payload)) {
			throw new ApiException(
				payload.error || 'Request failed',
				response.status,
				toFieldErrors(payload)
			);
		}

		throw new ApiException(`HTTP ${response.status}: ${response.statusText}`, response.status);
	}

	if (payload === null) {
		return {} as T;
	}

	return payload as T;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
	try {
		const response = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers: {
				Accept: 'application/json',
				...init?.headers
			}
		});

		return parseResponse<T>(response);
	} catch (error) {
		if (error instanceof ApiException) {
			throw error;
		}

		throw new ApiException('Network request failed', 0);
	}
}

export function createCrudApi<T, TInput>(resourcePath: string) {
	return {
		list: () => apiRequest<T[]>(resourcePath),
		get: (id: number) => apiRequest<T>(`${resourcePath}/${id}`),
		create: (input: TInput) =>
			apiRequest<T>(resourcePath, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			}),
		update: (id: number, input: TInput) =>
			apiRequest<void>(`${resourcePath}/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			}),
		remove: (id: number) =>
			apiRequest<void>(`${resourcePath}/${id}`, {
				method: 'DELETE'
			})
	};
}
