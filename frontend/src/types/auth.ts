import { SocialLink } from './form';

export type RegistrationStep =
    | 'login-register'
    | 'verify-email'
    | 'signing-in'
    | 'form-details'
    | 'company-creation'
    | 'registration-complete';

export type UserRole = 'startup_owner' | 'admin' | 'investor';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    permissions: number;
    profilePictureUrl?: string | null;
}

export interface AuthFormData {
    email: string;
    password: string;
}

export enum SocialPlatform {
    LinkedIn = 'linkedin',
    Instagram = 'instagram',
    Facebook = 'facebook',
    BlueSky = 'bluesky',
    X = 'x',
    Discord = 'discord',
    CustomUrl = 'custom_url',
}

export interface UserSocial {
    id: string;
    platform: SocialPlatform;
    urlOrHandle: string;
    userId: string;
    createdAt: number;
    updatedAt: number;
}

export interface UserDetailsData {
    firstName: string;
    lastName: string;
    position: string;
    bio: string;
    socials: SocialLink[];
}

export interface FormErrors {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    position?: string;
    bio?: string;
    linkedIn?: string;
}

export interface AuthFormProps {
    onSubmit: (data: AuthFormData) => Promise<void>;
    isLoading: boolean;
    errors: FormErrors;
    onToggleMode: () => void;
    mode: 'login' | 'register';
}

export interface UserDetailsFormProps {
    onSubmit: (data: UserDetailsData) => Promise<void>;
    isLoading: boolean;
    errors: FormErrors;
    initialData?: Partial<UserDetailsData>;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface CompanyFormErrors extends FormErrors {
    name?: string;
    dateFounded?: string;
    description?: string;
    stage?: string;
    website?: string;
    linkedin?: string;
}
