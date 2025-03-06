import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { TextInput, TextArea } from '@components';
import { SocialLinks } from '@/components/SocialLinks';
import type { SocialLink } from '@/types';

export interface TeamMemberFormData {
    first_name: string;
    last_name: string;
    title: string;
    detailed_biography: string;
    is_account_owner: boolean;
    commitment_type: string;
    introduction: string;
    industry_experience: string;
    previous_work: string;
    resume_external_url: string;
    resume_internal_url: string;
    founders_agreement_external_url: string;
    founders_agreement_internal_url: string;
    socialLinks: SocialLink[];
}

export interface TeamMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TeamMemberFormData) => void;
    onRemove?: () => void;
    initialData?: Partial<TeamMemberFormData>;
    mode: 'add' | 'edit';
}

interface FormErrors {
    first_name?: string;
    last_name?: string;
    title?: string;
    detailed_biography?: string;
    commitment_type?: string;
    introduction?: string;
    industry_experience?: string;
}

// helper to create a consistent form data object from initial data
const initializeFormData = (data: Partial<TeamMemberFormData> = {}): TeamMemberFormData => {
    // process social links to ensure all have ids
    const socialLinks = data.socialLinks || [];
    const processedSocialLinks = socialLinks.map(link => {
        if (!link.id) {
            return {
                ...link,
                id: Math.random().toString(36).substring(2, 9)
            };
        }
        return link;
    });
    
    // return consistent form data with defaults
    return {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        title: data.title || '',
        detailed_biography: data.detailed_biography || '',
        is_account_owner: data.is_account_owner || false,
        commitment_type: data.commitment_type || 'Full-time',
        introduction: data.introduction || '',
        industry_experience: data.industry_experience || '',
        previous_work: data.previous_work || '',
        resume_external_url: data.resume_external_url || '',
        resume_internal_url: data.resume_internal_url || '',
        founders_agreement_external_url: data.founders_agreement_external_url || '',
        founders_agreement_internal_url: data.founders_agreement_internal_url || '',
        socialLinks: processedSocialLinks,
    };
};

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onRemove,
    initialData = {},
    mode
}) => {
    const [formData, setFormData] = useState<TeamMemberFormData>(initializeFormData(initialData));
    const [errors, setErrors] = useState<FormErrors>({});

    // Update form data when initialData changes
    useEffect(() => {
        setFormData(initializeFormData(initialData));
    }, [initialData]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields
        if (!formData.first_name) newErrors.first_name = 'First name is required';
        if (!formData.last_name) newErrors.last_name = 'Last name is required';
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.detailed_biography) newErrors.detailed_biography = 'Bio is required';
        if (!formData.introduction) newErrors.introduction = 'Introduction is required';
        if (!formData.industry_experience) newErrors.industry_experience = 'Industry experience is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Get social links array from formData
            const socialLinks = formData.socialLinks ?? [];
            
            // Set up submission data with the socialLinks array
            const submissionData: TeamMemberFormData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                title: formData.title,
                detailed_biography: formData.detailed_biography,
                socialLinks: socialLinks,
                commitment_type: formData.commitment_type,
                introduction: formData.introduction,
                industry_experience: formData.industry_experience,
                previous_work: formData.previous_work || '',
                resume_external_url: formData.resume_external_url || '',
                resume_internal_url: formData.resume_internal_url || '',
                founders_agreement_external_url: formData.founders_agreement_external_url || '',
                founders_agreement_internal_url: formData.founders_agreement_internal_url || '',
                is_account_owner: formData.is_account_owner,
            };

            onSubmit(submissionData);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl">
                    <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium">
                            {mode === 'add' ? 'Add member' : 'Editing ' + formData.first_name + ' ' + formData.last_name}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form 
                        onSubmit={handleSubmit} 
                        className="p-4 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                    >
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <TextInput
                                    label="First name"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            first_name: e.target.value
                                        }));
                                        if (errors.first_name) {
                                            setErrors(prev => ({ ...prev, first_name: undefined }));
                                        }
                                    }}
                                    error={errors.first_name}
                                />
                            </div>
                            <div className="flex-1">
                                <TextInput
                                    label="Last name"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            last_name: e.target.value
                                        }));
                                        if (errors.last_name) {
                                            setErrors(prev => ({ ...prev, last_name: undefined }));
                                        }
                                    }}
                                    error={errors.last_name}
                                />
                            </div>
                        </div>

                        <TextInput
                            label="Position / Title"
                            required
                            value={formData.title}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }));
                                if (errors.title) {
                                    setErrors(prev => ({ ...prev, title: undefined }));
                                }
                            }}
                            error={errors.title}
                        />

                        <div>
                            <TextArea
                                label="Brief Bio & Expertise"
                                required
                                value={formData.detailed_biography}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        detailed_biography: e.target.value
                                    }));
                                    if (errors.detailed_biography) {
                                        setErrors(prev => ({ ...prev, detailed_biography: undefined }));
                                    }
                                }}
                                error={errors.detailed_biography}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div>
                            <TextArea
                                label="Introduction"
                                required
                                value={formData.introduction}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        introduction: e.target.value
                                    }));
                                    if (errors.introduction) {
                                        setErrors(prev => ({ ...prev, introduction: undefined }));
                                    }
                                }}
                                error={errors.introduction}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div>
                            <TextArea
                                label="Industry Experience"
                                required
                                value={formData.industry_experience}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        industry_experience: e.target.value
                                    }));
                                    if (errors.industry_experience) {
                                        setErrors(prev => ({ ...prev, industry_experience: undefined }));
                                    }
                                }}
                                error={errors.industry_experience}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Social Media & Web Presence
                            </label>
                            <div onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}>
                                <SocialLinks
                                    value={formData.socialLinks}
                                    onChange={(links: SocialLink[]) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            socialLinks: links
                                        }));
                                        // Clear any previous errors related to social links
                                        setErrors(prev => ({
                                            ...prev
                                        }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t">
                            {mode === 'edit' && onRemove && (
                                <button
                                    type="button"
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    onClick={onRemove}
                                >
                                    Remove member
                                </button>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                                >
                                    {mode === 'add' ? 'Save Changes' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}; 