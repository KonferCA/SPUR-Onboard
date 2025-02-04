import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import { TextInput, TextArea, Button } from '@/components';
import { SettingsPage } from '@/templates/SettingsPage/SettingsPage';
import { getUserProfile, updateUserProfile } from '@/services';
import { profileValidationSchema } from '@/types/user';
import type { UpdateProfileRequest } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/user/_auth/_appshell/settings/profile')({
    component: ProfileSettings,
});

function ProfileSettings() {
    const queryClient = useQueryClient();
    const { accessToken, user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // Fetch profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => {
            if (!accessToken || !user?.id) throw new Error('No access token or user ID');
            return getUserProfile(accessToken, user.id);
        },
        enabled: !!accessToken && !!user?.id, // Only run query if we have a token and user ID
    });

    // Update profile mutation
    const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
        mutationFn: (data: UpdateProfileRequest) => {
            if (!accessToken || !user?.id) throw new Error('No access token or user ID');
            return updateUserProfile(accessToken, user.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
            setError(null);
        },
        onError: (err) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to update profile');
            }
        },
    });

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            title: formData.get('title') as string,
            bio: formData.get('bio') as string,
            linkedin_url: formData.get('linkedin_url') as string,
        };

        try {
            // Validate form data
            profileValidationSchema.parse(data);
            updateProfile(data);
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.errors[0].message);
            }
        }
    };

    if (!accessToken || !user) {
        return (
            <SettingsPage title="Personal Profile">
                Please log in to view your profile.
            </SettingsPage>
        );
    }

    if (isLoading) {
        return <SettingsPage title="Personal Profile">Loading...</SettingsPage>;
    }

    const isEmptyProfile = !profile?.first_name && !profile?.last_name && !profile?.title && !profile?.bio;

    return (
        <SettingsPage title="Personal Profile" error={error}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <TextInput
                        name="first_name"
                        label="First name"
                        defaultValue={profile?.first_name}
                        required
                    />
                    <TextInput
                        name="last_name"
                        label="Last name"
                        defaultValue={profile?.last_name}
                        required
                    />
                    <TextInput
                        name="email"
                        label="Email"
                        defaultValue={user.email}
                        disabled
                    />
                    <TextInput
                        name="title"
                        label="Position/Title"
                        defaultValue={profile?.title}
                        required
                    />
                    <TextArea
                        name="bio"
                        label="Brief Biography"
                        defaultValue={profile?.bio}
                        required
                        rows={4}
                    />
                    <TextInput
                        name="linkedin_url"
                        label="LinkedIn Profile URL"
                        defaultValue={profile?.linkedin_url}
                        placeholder="https://linkedin.com/in/your-profile"
                        type="url"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    liquid
                    isLoading={isUpdating}
                >
                    {isEmptyProfile ? 'Complete Profile' : 'Save Changes'}
                </Button>
            </form>
        </SettingsPage>
    );
}

