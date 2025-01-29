import { useState, useEffect } from 'react';
import { Button, TextInput, TextArea } from '@/components';
import type { UserDetailsFormProps, UserDetailsData } from '@/types/auth';

const LINKEDIN_REGEX = /^(https?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/?$/;

export function UserDetailsForm({ 
    onSubmit, 
    isLoading, 
    errors,
    initialData 
}: UserDetailsFormProps) {
    const [formData, setFormData] = useState<UserDetailsData>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        position: initialData?.position || '',
        bio: initialData?.bio || '',
        linkedIn: initialData?.linkedIn || '',
    });

    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const hasAllFields = Object.values(formData).every(value => value.trim());
        const isLinkedInValid = LINKEDIN_REGEX.test(formData.linkedIn);
        setIsValid(hasAllFields && isLinkedInValid);
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isValid) {
            await onSubmit(formData);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-6">Complete Your Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label="First Name"
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                    />

                    <TextInput
                        label="Last Name"
                        required
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                    />
                </div>

                <TextInput
                    label="Position/Title"
                    required
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    error={errors.position}
                    placeholder="e.g., CEO, Founder, CTO"
                />

                <TextArea
                    label="Bio"
                    required
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    error={errors.bio}
                    placeholder="Tell us about yourself and your role (max 500 characters)"
                    maxLength={500}
                />

                <TextInput
                    label="LinkedIn Profile"
                    required
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    error={errors.linkedIn}
                    placeholder="https://linkedin.com/in/your-profile"
                />

                <div className="pt-4">
                    <Button
                        type="submit"
                        liquid
                        size="lg"
                        variant="primary"
                        disabled={isLoading || !isValid}
                    >
                        {isLoading ? 'Saving Profile...' : 'Complete Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default UserDetailsForm;