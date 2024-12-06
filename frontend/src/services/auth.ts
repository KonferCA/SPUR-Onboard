/**
 * This file contains business logic regarding authentication.
 */

import { getApiUrl, HttpStatusCode } from '@utils';
import { RegisterError } from './errors';

import type { User, UserRole } from '@t';

export interface RegisterReponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

/**
 * Registers a user if the given email is not already registered.
 */
export async function register(
    email: string,
    password: string,
    role: UserRole = 'startup_owner'
): Promise<RegisterReponse> {
    const url = getApiUrl('/auth/signup');
    const body = {
        email,
        password,
        role,
    };

    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // the backend should always return json for the api calls
    const json = await res.json();

    if (res.status !== HttpStatusCode.CREATED) {
        throw new RegisterError('Failed to register', res.status, json);
    }

    return json as RegisterReponse;
}

/**
 * Saves the refresh token in localStorage.
 */
export function saveRefreshToken(refreshToken: string) {
    // IMPORTANT:  The location on where the token is saved must be revisited.
    localStorage.setItem('refresh_token', refreshToken);
}
