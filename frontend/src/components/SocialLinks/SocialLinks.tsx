import React, { useState } from 'react';
import type { SocialLink } from '@/types';
import { SocialPlatform } from '@/types/auth';
import { SocialIconButton, TextInput, SocialCard } from '@/components';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { randomId } from '@/utils/random';
import {
    getErrorMsg,
    getModalTitle,
    getModelDescription,
    getSocialInputLabel,
    getSocialInputPlaceholder,
} from './helpers';
import { 
    getSocialPrefix, 
    validateSocialLink,
    sanitizeSocialInput 
} from '@/utils/social-links';

const allPlatforms: SocialPlatform[] = [
    SocialPlatform.LinkedIn,
    SocialPlatform.Facebook,
    SocialPlatform.Instagram,
    SocialPlatform.X,
    SocialPlatform.BlueSky,
    SocialPlatform.Discord,
    SocialPlatform.CustomUrl,
];

// simplified prefixes for test compatibility
const getDisplayPrefix = (platform: SocialPlatform | null): string => {
    switch (platform) {
        case SocialPlatform.Discord:
        case SocialPlatform.X:
        case SocialPlatform.Instagram:
        case SocialPlatform.BlueSky:
            return '@';
        case SocialPlatform.LinkedIn:
        case SocialPlatform.Facebook:
        case SocialPlatform.CustomUrl:
            return 'https://';
        default:
            return '';
    }
};

export interface SocialLinksProps {
    value: SocialLink[];
    required?: boolean;
    onChange: (links: SocialLink[]) => void;
    onRemove?: (link: SocialLink) => void;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
    value = [],
    required,
    onChange,
    onRemove,
}) => {
    const [urlOrHandle, setUrlOrHandle] = useState('');
    const [error, setError] = useState<string>('');
    const [currentSocialPlatform, setCurrentSocialPlatform] =
        useState<SocialPlatform | null>(null);
    const [isAddSocialModalOpen, setIsAddSocialModalOpen] = useState(false);

    const handleAddSocial = (platform: SocialPlatform) => {
        setIsAddSocialModalOpen(true);
        setCurrentSocialPlatform(platform);
    };

    const handleCloseAddSocialModal = () => {
        setIsAddSocialModalOpen(false);
        // Need to add the timeout to avoid the modal title/description to clear out before the fade out animation ends
        setTimeout(() => {
            setUrlOrHandle('');
            setError('');
            setCurrentSocialPlatform(null);
        }, 350);
    };

    const handleRemoveSocial = (socialToRemove: SocialLink) => {
        console.log('Removing social link:', socialToRemove);
        
        // Filter out the social link to remove by platform
        const updatedLinks = value.filter(social => social.platform !== socialToRemove.platform);
        
        console.log('Updated links after removal:', updatedLinks);
        
        // Call the parent's onChange with the updated list
        onChange(updatedLinks);
        
        // Also call the onRemove callback if provided
        if (onRemove) {
            onRemove(socialToRemove);
        }
    };

    const handleConfirmSocial = () => {
        if (!currentSocialPlatform) return;
        
        // sanitize input to prevent XSS
        const sanitizedInput = sanitizeSocialInput(urlOrHandle);
        
        const isValid = validateSocialLink({
            platform: currentSocialPlatform,
            urlOrHandle: sanitizedInput
        });
        
        if (isValid) {
            const prefix = getSocialPrefix(currentSocialPlatform);
            
            // properly handle URL prefixes to avoid duplication
            let finalUrl = sanitizedInput;
            
            // check if input already has our prefix or common variants
            const hasHttpPrefix = sanitizedInput.startsWith('http://') || sanitizedInput.startsWith('https://');
            const isPlatformSpecific = currentSocialPlatform !== SocialPlatform.CustomUrl;
            
            // for URLs that need specific domain prefixes (linkedin, facebook, etc.)
            if (isPlatformSpecific && hasHttpPrefix) {
                // already has http(s):// - use as is, the validation ensures it's correct
                finalUrl = sanitizedInput;
            } else if (isPlatformSpecific && !hasHttpPrefix && !sanitizedInput.startsWith('@')) {
                // check specific cases
                switch (currentSocialPlatform) {
                    case SocialPlatform.LinkedIn:
                        // handle common patterns
                        if (sanitizedInput.startsWith('www.linkedin.com/')) {
                            finalUrl = 'https://' + sanitizedInput;
                        } else {
                            finalUrl = prefix + sanitizedInput;
                        }
                        break;
                    case SocialPlatform.Facebook:
                        if (sanitizedInput.startsWith('www.facebook.com/')) {
                            finalUrl = 'https://' + sanitizedInput;
                        } else {
                            finalUrl = prefix + sanitizedInput;
                        }
                        break;
                    default:
                        // for other platforms, just use the prefix
                        finalUrl = prefix + sanitizedInput;
                }
            } else if (!sanitizedInput.startsWith(prefix)) {
                // for handles that need @ or custom URLs that need https://
                finalUrl = prefix + sanitizedInput;
            }
            
            onChange([
                ...value,
                {
                    id: randomId(),
                    platform: currentSocialPlatform,
                    urlOrHandle: finalUrl,
                },
            ]);
            handleCloseAddSocialModal();
        } else {
            setError(getErrorMsg(currentSocialPlatform));
        }
    };

    return (
        <div className="">
            <div className="flex items-center justify-between">
                <p>Social Media {' & '} Web Presence</p>
                <p className="text-sm text-gray-500">
                    {!required ? 'Optional' : 'Required'}
                </p>
            </div>
            <div className="p-4 border border-gray-300 bg-white rounded-md">
                <p className="mb-4">Select an account to add</p>
                <div className="flex gap-2 flex-wrap">
                    {allPlatforms.map((platform, idx) => (
                        <SocialIconButton
                            key={idx}
                            platform={platform}
                            disabled={
                                platform !== SocialPlatform.CustomUrl &&
                                !!value.find((s) => s.platform === platform)
                            }
                            onClick={handleAddSocial}
                        />
                    ))}
                </div>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {value.map((social, index) => (
                        <SocialCard
                            key={`${social.platform}-${social.id || index}`}
                            data={social}
                            onRemove={handleRemoveSocial}
                        />
                    ))}
                </div>
            </div>
            <ConfirmationModal
                title={getModalTitle(currentSocialPlatform)}
                description={getModelDescription(currentSocialPlatform)}
                isOpen={isAddSocialModalOpen && currentSocialPlatform !== null}
                onClose={handleCloseAddSocialModal}
                primaryAction={handleConfirmSocial}
            >
                <div>
                    <TextInput
                        value={urlOrHandle}
                        onChange={(e) => setUrlOrHandle(e.target.value)}
                        error={error}
                        required
                        prefix={getDisplayPrefix(currentSocialPlatform)}
                        label={getSocialInputLabel(currentSocialPlatform)}
                        placeholder={getSocialInputPlaceholder(
                            currentSocialPlatform
                        )}
                    />
                </div>
            </ConfirmationModal>
        </div>
    );
};
