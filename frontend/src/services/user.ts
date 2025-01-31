import { getApiUrl, HttpStatusCode } from '@/utils';

export interface UserDetails {
    firstName: string;
    lastName: string;
    bio: string;
    title: string;
    linkedin: string;
}

export async function updateUserDetails(
    id: string,
    token: string,
    details: UserDetails
) {
    const url = getApiUrl(`/users/${id}/details`);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
    });

    if (res.status !== HttpStatusCode.OK) {
        throw new Error('Failed to save user details');
    }
}
