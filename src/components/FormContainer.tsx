import { ReactNode } from 'react';

const FormContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col items-center px-4">
            <div className="w-full max-w-xl p-8">
                {children}
            </div>
        </div>
    );
};

export { FormContainer };