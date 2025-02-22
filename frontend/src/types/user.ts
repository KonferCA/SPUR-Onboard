import { z } from 'zod';

// Base user type from auth
export type UserRole = 'startup_owner' | 'admin';

export interface User {
    email: string;
    email_verified: boolean;
    permissions: number;
}

// Profile specific types
export interface UserProfile {
    first_name: string;
    last_name: string;
    title: string;
    bio: string;
    linkedin_url: string;
    is_account_owner: boolean;
    created_at: string;
    updated_at?: string;
}

// Request/Response types
export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    title?: string;
    bio?: string;
    linkedin_url?: string;
}

export interface UserSocialRequest {
    platform: string;
    urlOrHandle: string;
}

export interface InitialProfileRequest {
    firstName: string;
    lastName: string;
    title: string;
    bio: string;
    socials: UserSocialRequest[];
}

export interface ProfileResponse extends UserProfile {}

// Zod validation schemas
export const profileValidationSchema = z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    title: z.string().min(2, 'Title must be at least 2 characters'),
    bio: z.string().min(10, 'Bio must be at least 10 characters'),
    linkedin_url: z.string().url('Invalid LinkedIn URL').optional().nullable(),
});
