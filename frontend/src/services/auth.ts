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

let currentAccessToken: string | null = null;

/**
 * Registers a user if the given email is not already registered.
 */
export async function register(
    email: string,
    password: string,
    role: UserRole = 'startup_owner'
): Promise<RegisterReponse> {
    const url = getApiUrl('/auth/register');
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
    const url = getApiUrl('/auth/login');
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
        credentials: 'include'
    });

    const json = await res.json();

    if (res.status !== HttpStatusCode.OK) {
        throw new ApiError('Failed to sign in', res.status, json);
    }

    // Store the access token
    currentAccessToken = json.access_token;
    return json as SigninResponse;
}

export async function refreshAccessToken(): Promise<string> {
    const url = getApiUrl('/auth/verify');
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    if (!res.ok) {
        throw new ApiError('Failed to refresh token', res.status, await res.json());
    }

    const json = await res.json();
    currentAccessToken = json.access_token;
    return json.access_token;
}

export function getAccessToken(): string | null {
    return currentAccessToken;
}

// Add this utility function to handle API requests with auto-refresh
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    // Ensure credentials are included
    options.credentials = 'include';
    
    // Add access token if available
    const accessToken = getAccessToken();
    if (accessToken) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`
        };
    }
    
    let response = await fetch(url, options);
    
    if (response.status === 401) {
        // Try to refresh the token
        try {
            const newAccessToken = await refreshAccessToken();
            
            // Add the new access token to headers
            const headers = new Headers(options.headers);
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            options.headers = headers;
            
            // Retry the original request
            response = await fetch(url, options);
        } catch (error) {
            // If refresh fails, throw error to trigger logout
            throw new ApiError('Authentication failed', 401, {});
        }
    }
    
    return response;
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
        credentials: 'include' 
    });
    currentAccessToken = null;
}
