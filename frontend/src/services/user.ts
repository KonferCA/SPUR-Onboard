import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';
import type {
    InitialProfileRequest,
    ProfileResponse,
    UpdateProfileRequest,
} from '@/types/user';

/**
 * Get the current user's profile
 */
export async function getUserProfile(token: string): Promise<ProfileResponse> {
    // First get the company
    const companyUrl = getApiUrl('/v1/company');
    const companyResponse = await fetch(companyUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

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
    const url = getApiUrl(`/v1/companies/${companyId}/team`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

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
export async function updateUserProfile(
    token: string,
    data: UpdateProfileRequest
): Promise<ProfileResponse> {
    // First get the company
    const companyUrl = getApiUrl('/v1/company');
    const companyResponse = await fetch(companyUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

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
    const teamUrl = getApiUrl(`/v1/companies/${companyId}/team`);
    const teamResponse = await fetch(teamUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

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
    const url = getApiUrl(`/v1/companies/${companyId}/team/${profile.id}`);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
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

/**
 * Sets the initial user profile
 */
export async function initialUserProfile(
    token: string,
    id: string,
    data: InitialProfileRequest
) {
    const url = getApiUrl(`/users/${id}/details`);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError(
            'Failed to update user profile',
            res.status,
            await res.json()
        );
    }
}

