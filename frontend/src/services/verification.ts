import { getApiUrl } from '@/utils';
import { fetchWithAuth } from './auth';

export async function checkVerificationStatus(email: string): Promise<boolean> {
    try {
        const response = await fetchWithAuth(
            getApiUrl(`/auth/ami-verified?email=${encodeURIComponent(email)}`),
            {
                method: 'GET'
            }
        );

        if (!response.ok) {
            throw new Error('Failed to check verification status');
        }

        const data = await response.json();
        return data.verified;
    } catch (error) {
        console.error('Error checking verification status:', error);
        return false;
    }
}

export async function resendVerificationEmail(email: string): Promise<void> {
    try {
        const response = await fetchWithAuth(
            getApiUrl('/auth/resend-verification'),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to resend verification email');
        }
    } catch (error) {
        console.error('Error resending verification:', error);
        throw error;
    }
}