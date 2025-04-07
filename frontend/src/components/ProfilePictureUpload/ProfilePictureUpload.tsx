import { useAuth } from '@/contexts';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@components';
import { type FC, useRef, useState } from 'react';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';

interface ProfilePictureUploadProps {
    onUpload?: (url: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const ProfilePictureUpload: FC<ProfilePictureUploadProps> = ({
    onUpload,
}) => {
    const { user, setUser, getAccessToken } = useAuth();
    const { push } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleUpload = async (file: File) => {
        const accessToken = getAccessToken();
        if (!user?.id || !accessToken) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            const response = await fetch(
                `${API_BASE_URL}/users/${user.id}/profile-picture`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Failed to upload profile picture');
            }

            const data = await response.json();
            onUpload?.(data.url);
            setUser({
                ...user,
                profilePictureUrl: data.url,
            });
            push({
                message: 'Profile picture updated successfully',
                level: 'success',
            });
            // Clear preview and selected file after successful upload
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Upload error:', error);
            push({
                message: 'Failed to upload profile picture',
                level: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            push({
                message: 'Please upload a JPEG or PNG image',
                level: 'error',
            });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            push({
                message: 'File size must be less than 5MB',
                level: 'error',
            });
            return;
        }

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);

        // Clean up the preview URL when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
    };

    const handleRemove = async () => {
        const accessToken = getAccessToken();
        if (!user?.id || !accessToken) return;

        try {
            setIsUploading(true);
            const response = await fetch(
                `${API_BASE_URL}/users/${user.id}/profile-picture`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to remove profile picture');
            }

            onUpload?.('');
            setUser({
                ...user,
                profilePictureUrl: null,
            });
            push({
                message: 'Profile picture removed successfully',
                level: 'success',
            });
            // Clear preview and selected file after removal
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('Remove error:', error);
            push({
                message: 'Failed to remove profile picture',
                level: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelPreview = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const initials = user
        ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        : 'N';

    return (
        <div className="flex items-center gap-3">
            <ProfilePicture
                url={previewUrl || user?.profilePictureUrl}
                initials={initials}
                size="lg"
            />

            <div className="flex gap-2">
                {previewUrl ? (
                    <>
                        <Button
                            onClick={() =>
                                selectedFile && handleUpload(selectedFile)
                            }
                            isLoading={isUploading}
                            variant="primary"
                            size="sm"
                        >
                            Confirm Upload
                        </Button>
                        <Button
                            onClick={handleCancelPreview}
                            variant="outline"
                            size="sm"
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={isUploading}
                            variant="outline"
                            size="sm"
                        >
                            Upload Image
                        </Button>

                        {user?.profilePictureUrl && (
                            <Button
                                onClick={handleRemove}
                                isLoading={isUploading}
                                variant="outline"
                                size="sm"
                            >
                                Remove
                            </Button>
                        )}
                    </>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};
