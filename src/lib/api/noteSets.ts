/**
 * NoteSet API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { NoteSet, NoteSetInput } from '../types/noteSet';
import { createCrudApi } from './client';

const noteSetsApi = createCrudApi<NoteSet, NoteSetInput>('/noteSets');

/**
 * Fetch all note sets
 */
export async function listNoteSets(): Promise<NoteSet[]> {
	return noteSetsApi.list();
}

/**
 * Fetch a single note sets by ID
 */
export async function getNoteSet(id: number): Promise<NoteSet> {
	return noteSetsApi.get(id);
}

/**
 * Create a new note set
 */
export async function createNoteSet(input: NoteSetInput): Promise<NoteSet> {
	return noteSetsApi.create(input);
}

/**
 * Update an existing note set
 */
export async function updateNoteSet(id: number, input: NoteSetInput): Promise<void> {
	return noteSetsApi.update(id, input);
}

/**
 * Delete a note set by ID
 */
export async function deleteNoteSet(id: number): Promise<void> {
	return noteSetsApi.remove(id);
}
