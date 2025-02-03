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
    const { accessToken } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'basics' | 'socials'>('basics');
    const [newPlatformUrl, setNewPlatformUrl] = useState('');

    // Fetch profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => {
            if (!accessToken) throw new Error('No access token');
            return getUserProfile(accessToken);
        },
        enabled: !!accessToken, // Only run query if we have a token
    });

    // Update profile mutation
    const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
        mutationFn: (data: UpdateProfileRequest) => {
            if (!accessToken) throw new Error('No access token');
            return updateUserProfile(accessToken, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
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
            linkedin_url: (formData.get('linkedin_url') as string) || undefined,
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

    if (!accessToken) {
        return (
            <SettingsPage title="Personal Profile">
                Please log in to view your profile.
            </SettingsPage>
        );
    }

    if (isLoading) {
        return <SettingsPage title="Personal Profile">Loading...</SettingsPage>;
    }

    return (
        <SettingsPage title="Personal Profile" error={error}>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <Button
                    variant={activeTab === 'basics' ? 'outline' : 'secondary'}
                    onClick={() => setActiveTab('basics')}
                >
                    Basics
                </Button>
                <Button
                    variant={activeTab === 'socials' ? 'outline' : 'secondary'}
                    onClick={() => setActiveTab('socials')}
                >
                    Socials
                </Button>
            </div>

            {activeTab === 'basics' ? (
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
                            defaultValue="amir@konfer.ca"
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
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        liquid
                        isLoading={isUpdating}
                    >
                        Save
                    </Button>
                </form>
            ) : (
                <div className="space-y-8">
                    {/* Add new platform section */}
                    <div>
                        <h2 className="text-lg font-medium mb-2">
                            Add a new platform
                        </h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Connect social media or related websites
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <TextInput
                                    label="Paste URL link"
                                    value={newPlatformUrl}
                                    onChange={(e) =>
                                        setNewPlatformUrl(e.target.value)
                                    }
                                    placeholder="https://"
                                    type="url"
                                    className="flex-1"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        console.log(
                                            'Saving link:',
                                            newPlatformUrl
                                        );
                                        setNewPlatformUrl('');
                                    }}
                                    className="self-end"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Connected platforms */}
                    <div>
                        <h2 className="text-lg font-medium mb-4">Connected</h2>
                        <div className="space-y-2">
                            {profile?.linkedin_url && (
                                <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                            LinkedIn.com/company/konfer
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            console.log(
                                                'Remove:',
                                                profile.linkedin_url
                                            )
                                        }
                                        className="text-red-500 hover:text-red-600 !p-1"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </SettingsPage>
    );
}

