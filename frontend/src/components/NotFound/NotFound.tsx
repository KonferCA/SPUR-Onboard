import { Link } from '@tanstack/react-router';
import { FC } from 'react';

export const NotFound: FC = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="space-y-4">
                <h1 className="text-2xl">Oops, page not found</h1>
                <Link
                    to="/"
                    className="px-6 py-3 block text-center bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500 rounded-lg"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};
