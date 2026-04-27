/**
 * Team API client - handles all HTTP communication with the Ktor backend
 * Manages fetch calls, error handling, and validation error mapping
 */

import type { Team, TeamInput } from '../types/team';
import { createCrudApi } from './client';

const teamsApi = createCrudApi<Team, TeamInput>('/teams');

/**
 * Fetch all teams
 */
export async function listTeams(): Promise<Team[]> {
	return teamsApi.list();
}

/**
 * Fetch a single team by ID
 */
export async function getTeam(id: number): Promise<Team> {
	return teamsApi.get(id);
}

/**
 * Create a new team
 */
export async function createTeam(input: TeamInput): Promise<Team> {
	return teamsApi.create(input);
}

/**
 * Update an existing team
 */
export async function updateTeam(id: number, input: TeamInput): Promise<void> {
	return teamsApi.update(id, input);
}

/**
 * Delete a team by ID
 */
export async function deleteTeam(id: number): Promise<void> {
	return teamsApi.remove(id);
}
