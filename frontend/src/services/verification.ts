import { getApiUrl } from '@/utils';
import { ApiError } from './errors';
import type { User } from '@/types';

interface VerificationStatusResponse {
    verified: boolean;
}

/**
 * Checks the user's email verification status.
 * Uses cookies for authentication.
 */
export async function checkVerificationStatus(): Promise<boolean> {
    const url = getApiUrl('/auth/ami-verified');
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new ApiError('Failed to check verification status', response.status, errorData);
        }

        const data = await response.json() as VerificationStatusResponse;
        return data.verified;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            'Failed to check verification status',
            500,
            { message: error instanceof Error ? error.message : 'Unknown error' }
        );
    }
}

/**
 * Handles the email verification redirect from the backend.
 * Updates the auth state with the new verification status and token.
 */
export async function handleEmailVerificationRedirect(
    params: URLSearchParams,
    currentUser: User | null,
    setAuth: (user: User | null, token: string | null, companyId?: string | null) => void,
    companyId: string | null
): Promise<boolean> {
    const verified = params.get('verified') === 'true';
    const token = params.get('token');
    const email = params.get('email');

    if (!verified || !token || !email || !currentUser) {
        return false;
    }

    try {
        // Update the user object with the new verification status
        const updatedUser = {
            ...currentUser,
            email_verified: true,
            email: decodeURIComponent(email)
        };

        // Update auth state with the new token and verified user
        setAuth(updatedUser, decodeURIComponent(token), companyId);
        return true;
    } catch (error) {
        console.error('Error handling verification redirect:', error);
        return false;
    }
}

/**
 * Helper function to check if we're currently on a verification redirect URL
 */
export function isVerificationRedirect(params: URLSearchParams): boolean {
    return params.has('verified') && params.has('token') && params.has('email');
}