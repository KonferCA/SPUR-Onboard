import { SocialPlatform } from '@/types/auth';
import {
    DiscordLogoSVG,
    BlueskyLogoSVG,
    XLogoSVG,
    FacebookLogoSVG,
    InstagramLogoSVG,
    LinkedInLogoSVG,
} from '@/assets';
import { RxLink2, RxCross2 } from 'react-icons/rx';
import { FC, useMemo } from 'react';
import { SocialLink } from '@/types';

export interface SocialCardProps {
    data: SocialLink;
    onRemove?: (data: SocialLink) => void;
}

export const SocialCard: FC<SocialCardProps> = ({
    data: { platform, urlOrHandle, id },
    onRemove,
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

    const displayText = useMemo(() => {
        let idx = -1;
        switch (platform) {
            case SocialPlatform.BlueSky:
                idx = urlOrHandle.indexOf('.');
                return urlOrHandle.substring(0, idx);
            case SocialPlatform.Facebook:
            case SocialPlatform.LinkedIn:
                idx = urlOrHandle.lastIndexOf('/');
                return urlOrHandle.substring(idx + 1);
            case SocialPlatform.CustomUrl:
                let domain = urlOrHandle
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '');
                idx = domain.indexOf('/');
                if (idx !== -1) {
                    domain = domain.substring(0, idx);
                }
                return domain;
            default:
                return urlOrHandle;
        }
    }, [urlOrHandle]);

    const Icon =
        platform !== SocialPlatform.CustomUrl ? (
            <img src={logoSrc} alt={altText} className="w-6 h-6" />
        ) : (
            <RxLink2 className="w-6 h-6" />
        );

    return (
        <div className="rounded-md outline outline-1 outline-gray-300 p-2">
            <div className="flex justify-end">
                <button
                    type="button"
                    aria-label={`remove ${altText} social`}
                    onClick={() =>
                        onRemove
                            ? onRemove({ platform, urlOrHandle, id })
                            : null
                    }
                >
                    <RxCross2 className="h-4 w-4 text-red-500 transition hover:text-red-700" />
                </button>
            </div>
            <div className="flex items-center justify-center">{Icon}</div>
            <p className="font-medium text-center overflow-hidden text-ellipsis">
                {displayText}
            </p>
        </div>
    );
};
