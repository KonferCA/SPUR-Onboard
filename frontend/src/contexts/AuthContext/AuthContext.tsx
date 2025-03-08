import type React from 'react';
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import { refreshAccessToken, signout } from '@/services/auth';
import type { User } from '@/types';
import { snakeToCamel } from '@/utils/object';

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
    clearAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setCompanyId: (companyId: string | null) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef<number | null>(null);

    const setAuth = useCallback(
        (
            newUser: User | null,
            token: string | null,
            newCompanyId: string | null = null
        ) => {
            setUser(newUser);
            setAccessToken(token);
            setCompanyId(newCompanyId);
        },
        []
    );

    const clearAuth = useCallback(async () => {
        try {
            await signout();
        } finally {
            setUser(null);
            setAccessToken(null);
            setCompanyId(null);
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await refreshAccessToken();
                if (response) {
                    setUser(snakeToCamel(response.user));
                    setAccessToken(response.accessToken);
                    setCompanyId(response.companyId);

                    // Set up token refresh interval
                    if (intervalRef.current === null) {
                        const REFRESH_INTERVAL = 1000 * 60 * 4; // 4 minutes
                        intervalRef.current = window.setInterval(async () => {
                            try {
                                const response = await refreshAccessToken();
                                if (response) {
                                    setAccessToken(response.accessToken);
                                }
                            } catch {
                                clearAuth();
                            }
                        }, REFRESH_INTERVAL);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();

        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [clearAuth]);

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
                setUser,
                setAccessToken,
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
