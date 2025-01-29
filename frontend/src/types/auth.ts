export type RegistrationStep =
    | 'login-register'
    | 'verify-email'
    | 'signing-in'
    | 'form-details'
    | 'registration-complete';

export type UserRole = 'startup_owner' | 'admin' | 'investor';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    wallet_address: string;
    email_verified: boolean;
}

export interface AuthFormData {
    email: string;
    password: string;
}

export interface UserDetailsData {
    firstName: string;
    lastName: string;
    position: string;
    bio: string;
    linkedIn: string;
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
    access_token: string;
    user: User;
}