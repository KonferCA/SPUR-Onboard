import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const RegistrationGuard = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            if (!user.email_verified) {
                navigate('/register', {
                    state: {
                        step: 'verify-email',
                        email: user.email,
                    },
                    replace: true,
                });
                return;
            }
        }
    }, [user]);

    return <>{children}</>;
};

export { RegistrationGuard };

