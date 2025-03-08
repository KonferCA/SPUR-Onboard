import type React from 'react';
import { useState, useEffect, useRef, type FC } from 'react'
import { Link } from '@tanstack/react-router';
import { ProfilePicture } from '@/components/ProfilePicture/ProfilePicture';
import { IoSettingsOutline, IoLogOutOutline } from 'react-icons/io5';
import { BiChevronDown } from 'react-icons/bi';
import { motion } from 'framer-motion';

export interface UserDropdownProps {
    user: any;
    onLogout: () => Promise<void>;
    onSettingsClick?: () => void;
}

export const UserDropdown: FC<UserDropdownProps> = ({
    user,
    onLogout,
    onSettingsClick,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsOpen(!isOpen);
    };

    const handleSettingsClick = () => {
        setIsOpen(false);

        if (onSettingsClick) {
            onSettingsClick();
        }
    };

    const handleLogoutClick = async () => {
        setIsOpen(false);

        await onLogout();
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleButtonClick}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
            >
                <ProfilePicture
                    url={user?.profilePictureUrl}
                    initials={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || 'U'}`}
                    size="sm"
                />

                <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 180 : 360 }}
                    transition={{ duration: 0.2 }}
                >
                    <BiChevronDown className="w-5 h-5" />
                </motion.div>
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                >
                    <Link
                        to="/user/settings"
                        onClick={handleSettingsClick}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                        <IoSettingsOutline className="w-5 h-5 inline-block mr-2" />
                        Settings
                    </Link>

                    <button
                        onClick={handleLogoutClick}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                        <IoLogOutOutline className="w-5 h-5 inline-block mr-2" />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
};
