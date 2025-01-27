import React, { createContext, useContext, useState, useEffect } from 'react';
import { refreshAccessToken, signout } from '@/services/auth';
import type { User } from '@/types';

export interface AuthState {
    user: User | null;
    companyId: string | null;
    accessToken: string | null;
    isLoading: boolean;
    setAuth: (
        user: User | null,
        token: string | null,
        companyId?: string | null
    ) => void;
    clearAuth: () => void;
    setCompanyId: (companyId: string | null) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const LOCAL_STORAGE_AUTH_KEY = 'auth_state';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (savedAuth) {
            try {
                const { user, accessToken, companyId } = JSON.parse(savedAuth);
                setUser(user);
                setAccessToken(accessToken);
                setCompanyId(companyId); 
            } catch (error) {
                console.error('Failed to parse auth state from local storage: ', error);
                localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!accessToken) return;

        const REFRESH_INTERVAL = 1000 * 60 * 5; // 5 minutes
        let refreshTimeout: NodeJS.Timeout | null = null;

        const refreshToken = async () => {
            try {
                const newAccessToken = await refreshAccessToken();
                setAccessToken(newAccessToken);
                saveToLocalStorage({ user, accessToken: newAccessToken, companyId });
            } catch (error) {
                console.error('Failed to refresh token: ', error);
                clearAuth();
            }
        };

        refreshTimeout = setInterval(refreshToken, REFRESH_INTERVAL);

        return () => {
            if (refreshTimeout) {
                clearInterval(refreshTimeout);
            }
        }
    }, [accessToken, user, companyId]);

    const saveToLocalStorage = (authState: { user: User | null; accessToken: string | null; companyId: string | null }) => {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(authState));
    };

    const setAuth = (
        user: User | null,
        token: string | null,
        companyId: string | null = null
    ) => {
        setUser(user);
        setAccessToken(token);
        setCompanyId(companyId);
        saveToLocalStorage({ user, accessToken: token, companyId });
    };

    const clearAuth = async () => {
        try {
            await signout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            setCompanyId(null);
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                companyId,
                accessToken,
                isLoading,
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
