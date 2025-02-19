import React, { useState } from 'react';
import type { SocialLink } from '@/types';
import { SocialPlatform } from '@/types/auth';
import { SocialIconButton, TextInput, SocialCard } from '@/components';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { validateSocialLink } from '@/utils/form-validation';
import { randomId } from '@/utils/random';

const allPlatforms: SocialPlatform[] = [
    SocialPlatform.LinkedIn,
    SocialPlatform.Facebook,
    SocialPlatform.Instagram,
    SocialPlatform.X,
    SocialPlatform.BlueSky,
    SocialPlatform.Discord,
    SocialPlatform.CustomUrl,
];

export interface SocialLinksProps {
    value: SocialLink[];
    required?: boolean;
    onChange: (links: SocialLink[]) => void;
    onRemove: (link: SocialLink) => void;
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

    const getErrorMsgByPlatform = () => {
        switch (currentSocialPlatform) {
            case SocialPlatform.Discord:
                return 'Please enter a valid Discord username. I.E: example.username or example#0001';
            case SocialPlatform.X:
                return 'Please enter a valid X handle. I.E: example_handle';
            case SocialPlatform.Instagram:
                return 'Please enter a valid Instagram username. I.E: example.username';
            case SocialPlatform.Facebook:
                return 'Please enter a valid Facebook profile URL. I.E: www.facebook.com/username';
            case SocialPlatform.BlueSky:
                return 'Please enter a valid Bluesky handle. I.E: example.bluesky.com';
            case SocialPlatform.LinkedIn:
                return 'Please enter a valid LinkedIn profile URL. I.E: www.linkedin.com/in/username';
            case SocialPlatform.CustomUrl:
                return 'Please enter a valid URL. I.E: www.custom.com';
            default:
                break;
        }
        return '';
    };

    const handleConfirmSocial = () => {
        if (!currentSocialPlatform) return;
        const isValid = validateSocialLink({
            platform: currentSocialPlatform,
            urlOrHandle,
        });
        if (isValid) {
            onChange([
                ...value,
                {
                    id: randomId(),
                    platform: currentSocialPlatform,
                    urlOrHandle,
                },
            ]);
            handleCloseAddSocialModal();
        } else {
            setError(getErrorMsgByPlatform());
        }
    };

    const getModalTitleByPlatform = () => {
        let title = '';
        switch (currentSocialPlatform) {
            case SocialPlatform.Discord:
                title = 'Add your Discord Username';
                break;
            case SocialPlatform.X:
                title = 'Add your X Handle';
                break;
            case SocialPlatform.Instagram:
                title = 'Add your Instagram Profile';
                break;
            case SocialPlatform.Facebook:
                title = 'Add your Facebook Profile';
                break;
            case SocialPlatform.BlueSky:
                title = 'Add your Bluesky Handle';
                break;
            case SocialPlatform.LinkedIn:
                title = 'Add your LinkedIn Profile';
                break;
            case SocialPlatform.CustomUrl:
                title = 'Add your custom url';
                break;
            default:
                break;
        }
        return title;
    };

    const getModalDescriptionByPlatform = () => {
        let description = '';
        switch (currentSocialPlatform) {
            case SocialPlatform.Discord:
                description = 'Include your Discord username below';
                break;
            case SocialPlatform.X:
                description = 'Include your X (formerly Twitter) handle below';
                break;
            case SocialPlatform.Instagram:
                description = 'Include your Instagram username below';
                break;
            case SocialPlatform.Facebook:
                description = 'Include your Facebook profile URL';
                break;
            case SocialPlatform.BlueSky:
                description = 'Include your Bluesky handle below';
                break;
            case SocialPlatform.LinkedIn:
                description = 'Include your LinkedIn profile URL below';
                break;
            case SocialPlatform.CustomUrl:
                description = 'Include your custom URL below';
                break;
            default:
                break;
        }
        return description;
    };

    const getSocialInputLabelByPlatform = () => {
        let label = '';
        switch (currentSocialPlatform) {
            case SocialPlatform.Discord:
                label = 'Discord Username';
                break;
            case SocialPlatform.X:
                label = 'X Handle';
                break;
            case SocialPlatform.Instagram:
                label = 'Instagram Username';
                break;
            case SocialPlatform.Facebook:
            case SocialPlatform.LinkedIn:
                label = 'Profile URL';
                break;
            case SocialPlatform.BlueSky:
                label = 'Bluesky Handle';
                break;
            case SocialPlatform.CustomUrl:
                label = 'Custom URL';
                break;
            default:
                break;
        }
        return label;
    };

    const getSocialInputPlaceholderByPlatform = () => {
        let placeholder = '';
        switch (currentSocialPlatform) {
            case SocialPlatform.Discord:
                placeholder = 'mydiscord';
                break;
            case SocialPlatform.X:
                placeholder = 'example_handle';
                break;
            case SocialPlatform.Instagram:
                placeholder = 'example.username';
                break;
            case SocialPlatform.LinkedIn:
                placeholder = 'www.linkedin.com/in/';
                break;
            case SocialPlatform.Facebook:
                placeholder = 'www.facebook.com/';
                break;
            case SocialPlatform.BlueSky:
                placeholder = 'example.bluesky.com';
                break;
            case SocialPlatform.CustomUrl:
                placeholder = 'www.example.com';
                break;
            default:
                break;
        }
        return placeholder;
    };

    const getSocialPrefixByPlatform = () => {
        let prefix = '';
        switch (currentSocialPlatform) {
            case SocialPlatform.Discord:
            case SocialPlatform.X:
            case SocialPlatform.Instagram:
            case SocialPlatform.BlueSky:
                prefix = '@';
                break;
            case SocialPlatform.LinkedIn:
            case SocialPlatform.Facebook:
            case SocialPlatform.CustomUrl:
                prefix = 'https://';
                break;
            default:
                break;
        }
        return prefix;
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
                    {value.map((social) => (
                        <SocialCard
                            key={social.id}
                            data={social}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            </div>
            <ConfirmationModal
                title={getModalTitleByPlatform()}
                description={getModalDescriptionByPlatform()}
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
                        prefix={getSocialPrefixByPlatform()}
                        label={getSocialInputLabelByPlatform()}
                        placeholder={getSocialInputPlaceholderByPlatform()}
                    />
                </div>
            </ConfirmationModal>
        </div>
    );
};
