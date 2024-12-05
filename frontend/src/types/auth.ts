export type UserRole = 'startup_owner' | 'admin' | 'investor';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    walletAddress: string;
    isEmailVerified: boolean;
}
