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
export async function getUserProfile(token: string, userId: string): Promise<ProfileResponse> {
    const url = getApiUrl(`users/${userId}/details`);
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

    return response.json();
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(
    token: string,
    userId: string,
    data: UpdateProfileRequest
): Promise<ProfileResponse> {
    const url = getApiUrl(`users/${userId}/details`);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            firstName: data.first_name,
            lastName: data.last_name,
            title: data.title,
            bio: data.bio,
            linkedin: data.linkedin_url,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new ApiError(
            'Failed to update profile',
            response.status,
            errorData || {}
        );
    }

    // Return the updated profile
    return getUserProfile(token, userId);
}

/**
 * Sets the initial user profile
 */
export async function initialUserProfile(
    token: string,
    id: string,
    data: InitialProfileRequest
) {
    const url = getApiUrl(`users/${id}/details`);
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

