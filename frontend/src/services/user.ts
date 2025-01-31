import { getApiUrl } from '@utils';
import { ApiError } from './errors';
import { fetchWithAuth } from './auth';
import type { ProfileResponse, UpdateProfileRequest } from '@/types/user';

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<ProfileResponse> {
    // First get the company
    const companyUrl = getApiUrl('/company');
    const companyResponse = await fetchWithAuth(companyUrl);

    if (!companyResponse.ok) {
        const errorData = await companyResponse.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch company',
            companyResponse.status,
            errorData || {}
        );
    }

    const { id: companyId } = await companyResponse.json();

    // Then get the team members
    const url = getApiUrl(`/companies/${companyId}/team`);
    const response = await fetchWithAuth(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch user profile',
            response.status,
            errorData || {}
        );
    }

    const { team_members } = await response.json();
    // Find the team member that is the account owner
    const profile = team_members.find((member: any) => member.is_account_owner);
    if (!profile) {
        throw new ApiError('Failed to find user profile', 404, {});
    }

    return profile;
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    // First get the company
    const companyUrl = getApiUrl('/company');
    const companyResponse = await fetchWithAuth(companyUrl);

    if (!companyResponse.ok) {
        const errorData = await companyResponse.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch company',
            companyResponse.status,
            errorData || {}
        );
    }

    const { id: companyId } = await companyResponse.json();

    // Then get the team members
    const teamUrl = getApiUrl(`/companies/${companyId}/team`);
    const teamResponse = await fetchWithAuth(teamUrl);

    if (!teamResponse.ok) {
        const errorData = await teamResponse.json().catch(() => null);
        throw new ApiError(
            'Failed to fetch user profile',
            teamResponse.status,
            errorData || {}
        );
    }

    const { team_members } = await teamResponse.json();
    // Find the team member that is the account owner
    const profile = team_members.find((member: any) => member.is_account_owner);
    if (!profile) {
        throw new ApiError('Failed to find user profile', 404, {});
    }

    // Finally update the team member
    const url = getApiUrl(`/companies/${companyId}/team/${profile.id}`);
    const response = await fetchWithAuth(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to update profile',
            response.status,
            errorData || {}
        );
    }

    return response.json();
}