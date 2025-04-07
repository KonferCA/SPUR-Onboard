import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { createFileRoute } from '@tanstack/react-router';
import {
    TextInput,
    TextArea,
    Button,
    SocialLinks,
    NotificationBanner,
} from '@/components';
import { getUserProfile, updateUserProfile } from '@/services';
import { profileValidationSchema } from '@/types/user';
import type { UpdateProfileRequest } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload/ProfilePictureUpload';
import type { SocialLink } from '@/types';
import { useNotification } from '@/contexts';
import { usePageTitle } from '@/utils';

export const Route = createFileRoute('/user/_auth/_appshell/settings/profile')({
    component: ProfileSettings,
});

function ProfileSettings() {
    // set profile page title
    usePageTitle('Profile');

    const queryClient = useQueryClient();
    const { getAccessToken, user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [socials, setSocials] = useState<SocialLink[]>([]);
    const notification = useNotification();

    // fetch profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: () => {
            const accessToken = getAccessToken();
            if (!accessToken || !user?.id)
                throw new Error('No access token or user ID');
            return getUserProfile(accessToken, user.id);
        },
        enabled: !!getAccessToken() && !!user?.id, // only run query if we have a token and user ID
    });

    useEffect(() => {
        if (Array.isArray(profile?.socials)) {
            setSocials(profile.socials);
        }
    }, [profile]);

    // update profile mutation
    const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
        mutationFn: (data: UpdateProfileRequest) => {
            const accessToken = getAccessToken();
            if (!accessToken || !user?.id) {
                throw new Error('No access token or user ID');
            }

            return updateUserProfile(accessToken, user.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['profile', user?.id],
            });

            setError(null);
            notification.push({
                message: 'Successfully saved profile',
                level: 'success',
            });
        },
        onError: (err) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to update profile');
            }
        },
    });

    // handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data: UpdateProfileRequest = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            title: formData.get('title') as string,
            bio: formData.get('bio') as string,
            socials,
        };

        try {
            // validate form data
            profileValidationSchema.parse(data);
            updateProfile(data);
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.errors[0].message);
            }
        }
    };

    if (!getAccessToken() || !user) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">Not authenticated</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const isEmptyProfile =
        !profile?.firstName &&
        !profile?.lastName &&
        !profile?.title &&
        !profile?.bio;

    return (
        <>
            <h1 className="text-4xl font-bold mb-6">
                Personal <span className="text-[#F4802F]">Profile</span>
            </h1>

            {error && (
                <div className="mb-6">
                    <NotificationBanner message={error} variant="error" />
                </div>
            )}

            <hr className="mb-10" />

            <div className="bg-white rounded-lg border-2 border-gray-200 mb-6">
                <div className="p-6 mb-6">
                    <ProfilePictureUpload />
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 w-full text-base px-6 pb-6"
                >
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <TextInput
                                name="first_name"
                                label="First name"
                                defaultValue={profile?.firstName}
                                description="Minimum 2 characters"
                                required
                                className="border border-gray-200 rounded-lg focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                            />

                            <TextInput
                                name="last_name"
                                label="Last name"
                                defaultValue={profile?.lastName}
                                description="Minimum 2 characters"
                                required
                                className="border border-gray-200 rounded-lg focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                            />
                        </div>

                        <TextInput
                            name="email"
                            label="Email"
                            defaultValue={user.email}
                            disabled
                            className="border border-gray-200 rounded-lg transition-all duration-300"
                        />

                        <TextInput
                            name="title"
                            label="Position/Title"
                            defaultValue={profile?.title}
                            description="Minimum 2 characters"
                            required
                            className="border border-gray-200 rounded-lg focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                        />

                        <TextArea
                            name="bio"
                            label="Brief Biography"
                            defaultValue={profile?.bio}
                            description="Minimum 10 characters"
                            required
                            rows={4}
                            className="border border-gray-200 rounded-lg focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                        />

                        <SocialLinks
                            value={socials}
                            onChange={setSocials}
                            onRemove={(tobeRemoved) =>
                                setSocials((prev) =>
                                    prev.filter((l) => l.id !== tobeRemoved.id)
                                )
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        liquid
                        isLoading={isUpdating}
                        className="mt-8 bg-[#F4802F] hover:bg-[#E67321] border border-[#F4802F] text-white rounded-lg py-3 transition-all duration-300"
                    >
                        {isEmptyProfile ? 'Complete Profile' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </>
    );
}
