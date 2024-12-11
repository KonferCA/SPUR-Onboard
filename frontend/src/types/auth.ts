export type UserRole = 'startup_owner' | 'admin' | 'investor';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    wallet_address: string;
    email_verified: boolean;
}
