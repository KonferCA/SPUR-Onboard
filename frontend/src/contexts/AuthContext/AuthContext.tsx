import React, { createContext, useContext, useState } from 'react';
import type { User } from '@/types';

export interface AuthState {
    user: User | null;
    companyId: string | null;
    accessToken: string | null;
    setAuth: (
        user: User | null,
        token: string | null,
        companyId?: string | null
    ) => void;
    clearAuth: () => void;
    setCompanyId: (companyId: string | null) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const setAuth = (
        user: User | null,
        token: string | null,
        companyId: string | null = null
    ) => {
        setUser(user);
        setAccessToken(token);
        setCompanyId(companyId);
    };

    const clearAuth = () => {
        setUser(null);
        setAccessToken(null);
        setCompanyId(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                companyId,
                accessToken,
                setAuth,
                clearAuth,
                setCompanyId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
