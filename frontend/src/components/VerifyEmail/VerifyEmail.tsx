import { Button } from '@/components';
import { useAuth } from '@/contexts';
import { checkEmailVerifiedStatus } from '@/services/auth';
import { useEffect, useRef, useState } from 'react';
import { LogoSVG } from '@/assets';

interface VerifyEmailProps {
    email: string;
    onResendVerification: () => Promise<void>;
    onVerified: () => void;
    isResending: boolean;
}

export function VerifyEmail({
    email,
    onResendVerification,
    onVerified,
    isResending,
}: VerifyEmailProps) {
    const { user, accessToken } = useAuth();
    const intervalRef = useRef<number | null>(null);
    const [cooldownTime, setCooldownTime] = useState(0);
    const cooldownRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (user && user.emailVerified) return;

        if (accessToken) {
            if (intervalRef.current === null) {
                intervalRef.current = window.setInterval(async () => {
                    const verified = await checkEmailVerifiedStatus(accessToken);
                    
                    if (verified) {
                        onVerified();
                    }
                }, 3000);
            }
        }
        
        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [accessToken, user, onVerified]);
    
    useEffect(() => {
        if (cooldownTime > 0) {
            cooldownRef.current = window.setInterval(() => {
                setCooldownTime((prevTime) => {
                    const newTime = prevTime - 1;

                    if (newTime <= 0) {
                        if (cooldownRef.current !== null) {
                            window.clearInterval(cooldownRef.current);
                            cooldownRef.current = null;
                        }

                        return 0;
                    }

                    return newTime;
                });
            }, 1000);
        }
        
        return () => {
            if (cooldownRef.current !== null) {
                window.clearInterval(cooldownRef.current);

                cooldownRef.current = null;
            }
        };
    }, [cooldownTime]);
    
    const handleResendClick = async () => {
        await onResendVerification();
        setCooldownTime(45); // 45 seconds
    };
    
    const formatCooldownTime = () => {
        if (cooldownTime <= 0) return 'Resend Verification Email';

        return `Resend Available in ${cooldownTime}s`;
    };
    
    const isButtonDisabled = isResending || cooldownTime > 0;
    
    return (
        <>
            <div className="hidden md:block absolute top-0 left-0 p-6">
                <img src={LogoSVG} alt="Logo" className="h-8" />
            </div>
            
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
                <div className="md:hidden flex justify-center mb-6">
                    <img src={LogoSVG} alt="Logo" className="h-8" />
                </div>
                
                <h2 className="text-2xl font-semibold mb-4 ">
                    Verify Your Email
                </h2>

                <div className="space-y-4">
                    <p className="text-gray-600">
                        We've sent a verification email to:
                        <br />
                        <span className="font-medium text-gray-900">{email}</span>
                    </p>

                    <p className="text-gray-600">
                        Please check your inbox and click the verification link to
                        continue.
                    </p>

                    <div className="pt-4">
                        <p className="text-sm text-gray-500 mb-2">
                            Didn't receive the email?
                        </p>

                        <Button
                            variant="outline"
                            onClick={handleResendClick}
                            disabled={isButtonDisabled}
                        >
                            {isResending
                                ? 'Sending...'
                                : formatCooldownTime()}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VerifyEmail;