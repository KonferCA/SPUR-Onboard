import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const RegistrationGuard = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            if (!user.isEmailVerified) {
                navigate('/register', {
                    state: {
                        step: 'verify-email',
                        email: user.email
                    },
                    replace: true
                });
                return;
            }

            if (!user.firstName || !user.lastName) {
                navigate('/register', {
                    state: {
                        step: 'form-details',
                        email: user.email
                    },
                    replace: true
                });
                return;
            }
        }
    }, [user, navigate]);

    return <>{ children }</>
};

export { RegistrationGuard };