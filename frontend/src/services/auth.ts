/**
 * This file contains business logic regarding authentication.
 */

import { getApiUrl, HttpStatusCode } from '@utils';
import { ApiError } from './errors';

import type { User, UserRole } from '@t';
import { snakeToCamel } from '@/utils/object';

export interface AuthResponse {
    accessToken: string;
    companyId: string | null;
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
    const url = getApiUrl('/auth/register');
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
    });

    if (!res.ok) {
        throw new ApiError(
            'Failed to register',
            res.status,
            await res.json().catch(() => ({}))
        );
    }

    const json = await res.json();
    return snakeToCamel(json) as RegisterReponse;
}

/**
 * Signs in a user with email and password
 */
export async function signin(
    email: string,
    password: string
): Promise<SigninResponse> {
    const url = getApiUrl('/auth/login');

    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        throw new ApiError(
            'Failed to sign in',
            res.status,
            await res.json().catch(() => ({}))
        );
    }

    const json = await res.json();
    return snakeToCamel(json) as SigninResponse;
}

export async function refreshAccessToken(): Promise<AuthResponse> {
    const url = getApiUrl('/auth/verify');
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new ApiError(
            'Failed to refresh token',
            res.status,
            await res.json()
        );
    }

    const json = await res.json();
    return snakeToCamel(json) as AuthResponse;
}

/**
 * Signs out the current user by:
 * 1. Calling the signout endpoint to clear the refresh token cookie
 * 2. Clearing the auth context
 */
export async function signout(): Promise<void> {
    const url = getApiUrl('/auth/logout');
    await fetch(url, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function checkEmailVerifiedStatus(
    accessToken: string
): Promise<boolean> {
    const url = getApiUrl('/auth/ami-verified');
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const body = await res.json();
    return res.status === HttpStatusCode.OK && body.verified;
}
