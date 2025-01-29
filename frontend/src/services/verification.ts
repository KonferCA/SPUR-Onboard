import { getApiUrl } from '@/utils';
import { fetchWithAuth } from './auth';
import type { User } from '@/types';

interface VerificationStatusResponse {
    verified: boolean;
}

export async function checkVerificationStatus(): Promise<boolean> {
    try {
        const response = await fetchWithAuth(
            getApiUrl('/auth/ami-verified'),
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to check verification status');
        }

        const data = await response.json() as VerificationStatusResponse;
        return data.verified;
    } catch (error) {
        console.error('Error checking verification status:', error);
        return false;
    }
}

export async function handleEmailVerificationRedirect(
    params: URLSearchParams,
    currentUser: User | null,
    setAuth: (user: User | null, token: string | null, companyId?: string | null) => void,
    companyId: string | null
): Promise<boolean> {
    const verified = params.get('verified') === 'true';
    const token = params.get('token');
    const email = params.get('email');

    if (verified && token && email && currentUser) {
        const updatedUser = {
            ...currentUser,
            email_verified: true,
            email: email
        };
        setAuth(updatedUser, token, companyId);
        return true;
    }
    
    return false;
}