import { FC } from 'react';

interface ProfilePictureProps {
    url?: string | null;
    initials?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
};

export const ProfilePicture: FC<ProfilePictureProps> = ({
    url,
    initials = 'N',
    size = 'md',
    className = '',
}) => {
    if (!url) {
        return (
            <div
                className={`${sizeClasses[size]} ${className} bg-gray-400 rounded-full flex items-center justify-center text-white font-medium`}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={url}
            alt="Profile"
            className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
        />
    );
};
