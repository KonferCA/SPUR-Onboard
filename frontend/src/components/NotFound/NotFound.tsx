import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NotFoundBgSVG } from '@assets';

export const NotFound: FC = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <img
                src={NotFoundBgSVG}
                alt=""
                aria-hidden
                className="fixed inset-0 -z-20 w-full h-full object-cover"
            />
            {/* overlay for img */}
            <div
                aria-hidden
                className="fixed inset-0 -z-10 w-full h-full bg-gray-900/10"
            ></div>
            <div className="space-y-4 2k:space-y-8 p-6 md:p-0">
                <h1 className="font-bold text-4xl sm:text-6xl 2k:text-[7.5rem] text-[#DA1E28] text-center">
                    Page Not Found
                </h1>
                <p className="text-lg sm:text-2xl 2k:text-4xl text-center text-black">
                    {"We're sorry, the page you're looking for cannot "}
                    <br className="hidden md:block" />
                    {'be found or no longer exists'}
                </p>
                <Link
                    to="/"
                    className="text-lg sm:text-2xl 2k:text-4xl w-fit px-7 2k:px-9 py-3 2k:py-6 block transition text-center bg-white text-black rounded 2k:rounded-xl ring-1 ring-gray-300 shadow mx-auto hover:bg-gray-50"
                >
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};
