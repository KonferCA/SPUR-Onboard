/**
 * This file contains business logic regarding authentication.
 */

import { getApiUrl, HttpStatusCode } from '@utils';
import { RegisterError, ApiError } from './errors';

import type { User, UserRole } from '@t';

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface RegisterReponse extends AuthResponse {}
export interface SigninResponse extends AuthResponse {}

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
 * Signs in a user with email and password
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
    });

    const json = await res.json();

    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to sign in', res.status, json);
    }

    return json as SigninResponse;
}

/**
 * Signs out the current user by:
 * 1. Calling the signout endpoint to clear the refresh token cookie
 * 2. Clearing the auth context
 */
export async function signout(): Promise<void> {
    const url = getApiUrl('/auth/signout');
    await fetch(url, { method: 'POST' });
}
