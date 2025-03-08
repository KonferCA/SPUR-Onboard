import type React from 'react';
import { useState } from 'react';
import type { SocialLink } from '@/types';
import { SocialPlatform } from '@/types/auth';
import { SocialIconButton, TextInput, SocialCard } from '@/components';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { validateSocialLink } from '@/utils/form-validation';
import { randomId } from '@/utils/random';
import {
    getErrorMsg,
    getModalTitle,
    getModelDescription,
    getSocialInputLabel,
    getSocialInputPlaceholder,
    getSocialPrefix,
} from './helpers';

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

    const handleConfirmSocial = () => {
        if (!currentSocialPlatform) return;
        const isValid = validateSocialLink({
            platform: currentSocialPlatform,
            urlOrHandle,
        });
        if (isValid) {
            const prefix = getSocialPrefix(currentSocialPlatform);
            onChange([
                ...value,
                {
                    id: randomId(),
                    platform: currentSocialPlatform,
                    urlOrHandle: urlOrHandle.startsWith(prefix)
                        ? urlOrHandle
                        : getSocialPrefix(currentSocialPlatform) + urlOrHandle,
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
                        prefix={getSocialPrefix(currentSocialPlatform)}
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
