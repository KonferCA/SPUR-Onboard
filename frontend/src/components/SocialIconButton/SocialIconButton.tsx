import {
    DiscordLogoSVG,
    BlueskyLogoSVG,
    XLogoSVG,
    FacebookLogoSVG,
    InstagramLogoSVG,
    LinkedInLogoSVG,
} from '@/assets';
import { SocialPlatform } from '@/types/auth';
import { RxLink2 } from 'react-icons/rx';
import { type FC, useMemo } from 'react';
import { cva } from 'class-variance-authority';

const buttonStyles = cva('p-2 bg-blue-50 rounded-md', {
    variants: {
        disabled: {
            true: ['grayscale'],
        },
    },
});

export interface SocialIconButtonProps {
    platform: SocialPlatform;
    disabled?: boolean;
    onClick: (platform: SocialPlatform) => void;
}

export const SocialIconButton: FC<SocialIconButtonProps> = ({
    platform,
    disabled,
    onClick,
}) => {
    const [logoSrc, altText] = useMemo(() => {
        switch (platform) {
            case SocialPlatform.Discord:
                return [DiscordLogoSVG, 'Discord'];
            case SocialPlatform.BlueSky:
                return [BlueskyLogoSVG, 'Bluesky'];
            case SocialPlatform.X:
                return [XLogoSVG, 'X'];
            case SocialPlatform.Instagram:
                return [InstagramLogoSVG, 'Instagram'];
            case SocialPlatform.Facebook:
                return [FacebookLogoSVG, 'Facebook'];
            case SocialPlatform.LinkedIn:
                return [LinkedInLogoSVG, 'LinkedIn'];
            default:
                break;
        }
        return ['', ''];
    }, [platform]);

    return (
        <button
            type="button"
            aria-label={`Add ${altText} account`}
            className={buttonStyles({ disabled })}
            onClick={() => onClick(platform)}
            disabled={disabled}
        >
            {platform !== SocialPlatform.CustomUrl ? (
                <img src={logoSrc} alt={altText} className="w-6 h-6" />
            ) : (
                <RxLink2 className="w-6 h-6" />
            )}
        </button>
    );
};
