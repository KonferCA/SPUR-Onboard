/**
 * This file contains business logic regarding authentication.
 */

import { getApiUrl, HttpStatusCode } from '@utils';
import { RegisterError } from './errors';

import type { User, UserRole } from '@t';

export interface RegisterResponse {
    accessToken: string;
    user: User;
}

export interface SigninResponse {
    accessToken: string;
    user: User;
}

/**
 * Registers a user if the given email is not already registered.
 */
export async function register(
    email: string,
    password: string,
    role: UserRole = 'startup_owner'
): Promise<RegisterResponse> {
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
        credentials: 'include', // needed for cookies
    });
    
    const json = await res.json();

    if (res.status !== HttpStatusCode.CREATED) {
        throw new RegisterError('Failed to register', res.status, json);
    }

    return json as RegisterResponse;
}

/**
 * Signs in a user with email and password.
 */
export async function signin(
    email: string,
    password: string
): Promise<SigninResponse> {
    const url = getApiUrl('/auth/signin');
    const body = {
        email,
        password,
    };

    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // needed for cookies
    });

    const json = await res.json();

    if (res.status !== HttpStatusCode.OK) {
        throw new RegisterError('Failed to sign in', res.status, json);
    }

    return json as SigninResponse;
}

/**
 * Refreshes the access token using the refresh token stored in HTTP-only cookie.
 * Returns the new access token if successful.
 */
export async function refreshAccessToken(): Promise<string> {
    const url = getApiUrl('/auth/refresh');
    
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include', // needed for cookies
    });

    if (!res.ok) {
        throw new Error('Failed to refresh access token');
    }

    const json = await res.json();
    return json.access_token;
}

/**
 * Signs out the user by clearing the refresh token cookie.
 */
export async function signout(): Promise<void> {
    const url = getApiUrl('/auth/signout');
    
    await fetch(url, {
        method: 'POST',
        credentials: 'include',
    });
}
