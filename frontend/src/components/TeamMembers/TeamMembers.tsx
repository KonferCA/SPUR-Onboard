import type React from 'react';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit } from 'react-icons/fi';
import {
    TextArea,
    TextInput,
    type UploadableFile,
    SocialLinks,
    Button,
} from '@components';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import type { TeamMember } from '@/types';
import type { SocialLink } from '@/types';
import { SocialPlatform } from '@/types/auth';
import {
    addTeamMember,
    deleteTeamMember,
    uploadTeamMemberDocument,
    updateTeamMember,
} from '@/services/teams';
import { useAuth, useNotification } from '@/contexts';
import { getUserProfile } from '@/services/user';
import { randomId } from '@/utils/random';

export interface TeamMembersProps {
    initialValue: TeamMember[];
    disabled?: boolean;
}

interface LocalTeamMember extends TeamMember {
    isLoading: boolean;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
    initialValue = [],
    disabled = false,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingMember, setEditingMember] = useState<LocalTeamMember | null>(null);
    const [newMember, setNewMember] = useState<Partial<LocalTeamMember>>({});
    const [members, setMembers] = useState<LocalTeamMember[]>([]);
    const [resumeFile, setResumeFile] = useState<UploadableFile | null>(null);
    const [foundersAgreementFile, setFoundersAgreementFile] =
        useState<UploadableFile | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    const { accessToken, companyId, user } = useAuth();
    const notification = useNotification();

    useEffect(() => {
        const initializeMembers = async () => {
            if (user && accessToken) {
                try {
                    const userProfile = await getUserProfile(
                        accessToken,
                        user.id
                    );

                    const accountOwner: LocalTeamMember = {
                        id: user.id,
                        firstName: user.firstName || user.email.split('@')[0],
                        lastName: user.lastName || '',
                        title: userProfile.title || 'Account Owner',
                        detailedBiography: userProfile.bio || '',
                        socialLinks: [],
                        resumeExternalUrl: '',
                        resumeInternalUrl: '',
                        introduction: '',
                        commitmentType: 'Full-time',
                        industryExperience: '',
                        previousWork: '',
                        founderAgreementExternalUrl: '',
                        founderAgreementInternalUrl: '',
                        isAccountOwner: true,
                        isLoading: false,
                        created_at: Date.now(),
                    };

                    const otherMembers = initialValue
                        .filter((member) => !member.isAccountOwner)
                        .map((member) => ({ ...member, isLoading: false }));

                    setMembers([accountOwner, ...otherMembers]);
                } catch (e) {
                    console.error(e);
                    notification.push({
                        message: 'Failed to fetch owner profile',
                        level: 'error',
                        autoClose: true,
                        duration: 2000,
                    });

                    // still add the account owner even if profile fetch fails, but with minimal info
                    const accountOwner: LocalTeamMember = {
                        id: user.id,
                        firstName: user.firstName || user.email.split('@')[0],
                        lastName: user.lastName || '',
                        title: 'Account Owner',
                        detailedBiography: '',
                        socialLinks: [],
                        resumeExternalUrl: '',
                        resumeInternalUrl: '',
                        introduction: '',
                        commitmentType: 'Full-time',
                        industryExperience: '',
                        previousWork: '',
                        founderAgreementExternalUrl: '',
                        founderAgreementInternalUrl: '',
                        isAccountOwner: true,
                        isLoading: false,
                        created_at: Date.now(),
                    };

                    const otherMembers = initialValue
                        .filter(member => !member.isAccountOwner)
                        .map(member => ({
                            ...member,
                            isLoading: false
                        }));
                }
            }
        };

        initializeMembers();
    }, [user, accessToken, initialValue, notification.push]);

    // Add a cleanup effect when forms are closed
    useEffect(() => {
        if (!isAdding && !isEditing) {
            // If neither form is open, make sure socialLinks are reset
            setSocialLinks([]);
        }
    }, [isAdding, isEditing]);

    const checkAllRequired = () => {
        return (
            newMember.firstName &&
            newMember.lastName &&
            newMember.title &&
            newMember.detailedBiography
        );
    };

    const saveToDatabase = async (member: LocalTeamMember) => {
        if (!accessToken || !companyId) {
            // remove member from the list
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
            return;
        }

        const notificationId = notification.push({
            message: 'Saving team member...',
            level: 'info',
            autoClose: false,
        });
        try {
            const res = await addTeamMember(accessToken, {
                companyId,
                member: {
                    ...member
                },
            });
            const originalId = member.id;

            // upload files
            if (resumeFile) {
                await uploadTeamMemberDocument(accessToken, {
                    memberId: res.id,
                    docType: 'resume',
                    companyId,
                    file: resumeFile,
                });
            }

            if (foundersAgreementFile) {
                await uploadTeamMemberDocument(accessToken, {
                    memberId: res.id,
                    docType: 'founders_agreement',
                    companyId,
                    file: foundersAgreementFile,
                });
            }

            // Update the member id to the response id
            // the response has the permament id generated by the backend
            Object.assign(member, {
                id: res.id,
                isLoading: false,
            });

            setTimeout(() => {
                notification.update(notificationId, {
                    message: 'Team member saved',
                    level: 'success',
                    autoClose: true,
                    duration: 1000,
                });
            }, 1000);

            setMembers((prev) =>
                prev.map((m) => (m.id === originalId ? { ...member } : m))
            );
        } catch (e) {
            console.error(e);
            // remove member from the list
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
            notification.update(notificationId, {
                message: 'Failed to save team member',
                level: 'error',
                autoClose: true,
                duration: 2000,
            });
        }
    };

    const handleAdd = () => {
        if (checkAllRequired()) {
            const member: LocalTeamMember = {
                id: randomId(),
                firstName: newMember.firstName!,
                // biome-ignore lint/style/noNonNullAssertion: null assertion doesn't apply here since checkAllRequired validates the newMember object
                lastName: newMember.lastName!,
                // biome-ignore lint/style/noNonNullAssertion: null assertion doesn't apply here since checkAllRequired validates the newMember object
                title: newMember.title!,
                // biome-ignore lint/style/noNonNullAssertion: null assertion doesn't apply here since checkAllRequired validates the newMember object
                detailedBiography: newMember.detailedBiography!,
                resumeExternalUrl: '',
                resumeInternalUrl: '',
                introduction: newMember.detailedBiography!,
                commitmentType: 'Full-time',
                industryExperience: '',
                previousWork: '',
                founderAgreementExternalUrl: '',
                founderAgreementInternalUrl: '',
                isAccountOwner: false,
                isLoading: true,
                created_at: Date.now(),
                socialLinks: [...socialLinks],
            };

            saveToDatabase(member);
            // optimistic addition
            setMembers((prev) => [...prev, member]);
            setNewMember({});
            setSocialLinks([]);
            setIsAdding(false);
        }
    };

    const removeFromDatabase = async (member: LocalTeamMember) => {
        if (!accessToken || !companyId) {
            // add the member that was removed
            setMembers((prev) => [...prev, member]);
            return;
        }
        const notificationId = notification.push({
            message: 'Removing team member...',
            level: 'info',
            autoClose: false,
        });
        try {
            await deleteTeamMember(accessToken, { companyId, member });
            setTimeout(() => {
                notification.update(notificationId, {
                    message: 'Team member removed',
                    level: 'success',
                    autoClose: true,
                    duration: 1000,
                });
            }, 1000);
        } catch (e) {
            console.error(e);
            // add the member that was removed
            setMembers((prev) => [...prev, member]);
            notification.update(notificationId, {
                message: 'Failed to remove team member',
                level: 'error',
                autoClose: true,
                duration: 2000,
            });
        }
    };

    const handleRemove = (member: LocalTeamMember) => {
        if (member.isAccountOwner) return;

        // optimistic removal
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        removeFromDatabase(member);
    };

    const handleStartEdit = (member: LocalTeamMember) => {
        setEditingMember(member);
        setIsEditing(true);
        
        console.log('Starting edit for member with social links:', member.socialLinks);
        
        // Set the socialLinks array from the member's data
        // Ensure each link has a unique ID
        const links = (member.socialLinks || []).map(link => ({
            ...link,
            id: link.id || randomId()
        }));
        
        console.log('Initialized social links for editing:', links);
        
        setSocialLinks(links);
    };

    const handleEdit = async () => {
        if (!editingMember) return;
        
        console.log('Starting handleEdit with socialLinks:', socialLinks);
        
        // Helper function to format URLs
        const formatUrl = (handle: string, platform: SocialPlatform): string => {
            if (!handle) return '';
            // if it's already a url, return it
            if (handle.startsWith('http://') || handle.startsWith('https://')) return handle;
            // if it starts with @, remove it
            const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
            switch (platform) {
                case SocialPlatform.X:
                    return `https://twitter.com/${cleanHandle}`; // TODO: change to x.com? This works for now
                case SocialPlatform.Discord:
                    return `https://discord.com/users/${cleanHandle}`;
                case SocialPlatform.BlueSky:
                    return `https://bsky.app/profile/${cleanHandle}`;
                case SocialPlatform.Facebook:
                    return `https://facebook.com/${cleanHandle}`;
                case SocialPlatform.Instagram:
                    return `https://instagram.com/${cleanHandle}`;
                case SocialPlatform.LinkedIn:
                    return `https://linkedin.com/in/${cleanHandle}`;
                default:
                    return handle;
            }
        };

        const updatedMember: LocalTeamMember = {
            ...editingMember,
            firstName: newMember.firstName || editingMember.firstName,
            lastName: newMember.lastName || editingMember.lastName,
            title: newMember.title || editingMember.title,
            detailedBiography: newMember.detailedBiography || editingMember.detailedBiography,
            socialLinks: socialLinks.map(link => ({
                ...link,
                urlOrHandle: formatUrl(link.urlOrHandle, link.platform as SocialPlatform)
            })),
            isLoading: false,
            resumeExternalUrl: editingMember.resumeExternalUrl,
            resumeInternalUrl: editingMember.resumeInternalUrl,
            introduction: editingMember.introduction,
            commitmentType: editingMember.commitmentType,
            industryExperience: editingMember.industryExperience,
            previousWork: editingMember.previousWork,
            founderAgreementExternalUrl: editingMember.founderAgreementExternalUrl,
            founderAgreementInternalUrl: editingMember.founderAgreementInternalUrl,
            isAccountOwner: editingMember.isAccountOwner,
            created_at: editingMember.created_at,
            updated_at: editingMember.updated_at,
        };
        
        console.log('Updated member:', {
            id: updatedMember.id,
            socials: updatedMember.socialLinks
        });

        // Update in database
        try {
            const notificationId = notification.push({
                message: 'Updating team member...',
                level: 'info',
                autoClose: false,
            });

            console.log('About to call updateTeamMember with member:', {
                ...updatedMember,
                socialLinks: updatedMember.socialLinks
            });

            await updateTeamMember(accessToken!, {
                companyId: companyId!,
                member: updatedMember,
            });

            setTimeout(() => {
                notification.update(notificationId, {
                    message: 'Team member updated',
                    level: 'success',
                    autoClose: true,
                    duration: 1000,
                });
            }, 1000);

            // Update local state
            setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
            setIsEditing(false);
            setEditingMember(null);
            setNewMember({});
            setSocialLinks([]);
        } catch (e) {
            console.error(e);
            notification.push({
                message: 'Failed to update team member',
                level: 'error',
                autoClose: true,
                duration: 2000,
            });
        }
    };

    return (
        <div className="space-y-4">
            {/* Member List */}
            <div className="flex flex-wrap gap-6">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="relative bg-white rounded-lg shadow-sm border border-gray-200 w-32 h-32 p-3"
                    >
                        {/* Edit button */}
                        {!member.isLoading && !disabled && !member.isAccountOwner && (
                            <button
                                type="button"
                                onClick={() => handleStartEdit(member)}
                                className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
                            >
                                <FiEdit size={12} />
                            </button>
                        )}

                        {/* Content wrapper */}
                        <div className="h-full flex flex-col items-center justify-between">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-medium">
                                {member.firstName[0].toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="w-full">
                                <div className="font-medium text-gray-900 truncate text-center text-sm" style={{ width: '90px', margin: '0 auto' }}>
                                    {[member.firstName, member.lastName].join(' ')}
                                </div>
                                <div className="text-sm text-gray-500 truncate text-center" style={{ width: '90px', margin: '0 auto' }}>
                                    {member.title}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Member Button */}
                {!disabled && !isAdding && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            setSocialLinks([]);
                            setNewMember({});
                            setIsAdding(true);
                        }}
                        className="w-32 h-32 rounded-lg bg-[#154261] hover:bg-[#2B4A67] flex flex-col items-center justify-center space-y-2"
                    >
                        <span className="text-md font-medium text-white">Add new</span>
                        <span className="text-md font-medium text-white">member</span>
                        <FiPlus size={24} className="text-white mt-1" />
                    </Button>
                )}
            </div>

            {/* Member Modal */}
            <ConfirmationModal
                isOpen={isAdding}
                onClose={() => {
                    setIsAdding(false);
                    setNewMember({});
                    setResumeFile(null);
                    setFoundersAgreementFile(null);
                    setSocialLinks([]);
                }}
                title="Add member"
                primaryAction={handleAdd}
                primaryActionText="Save Changes"
                primaryButtonClassName="bg-[#F15A24] hover:bg-[#D14A14]"
                secondaryActionText="Cancel"
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <TextInput
                            label="First name"
                            value={newMember.firstName || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextInput
                            label="Last name"
                            value={newMember.lastName || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>
                    
                    <TextInput
                        label="Position / Title"
                        value={newMember.title || ''}
                        onChange={(e) =>
                            setNewMember((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                        }
                        required
                    />

                    <TextArea
                        label="Brief Bio & Expertise"
                        value={newMember.detailedBiography || ''}
                        onChange={(e) =>
                            setNewMember((prev) => ({
                                ...prev,
                                detailedBiography: e.target.value,
                            }))
                        }
                        required
                    />

                    <SocialLinks
                        value={socialLinks}
                        onChange={setSocialLinks}
                    />
                </div>
            </ConfirmationModal>

            {/* Edit Member Modal */}
            <ConfirmationModal
                isOpen={isEditing}
                onClose={() => {
                    setIsEditing(false);
                    setEditingMember(null);
                    setNewMember({});
                    setSocialLinks([]);
                }}
                title={`Editing ${editingMember ? [editingMember.firstName, editingMember.lastName].join(' ') : ''}`}
                primaryAction={handleEdit}
                primaryActionText="Save Changes"
                primaryButtonClassName="bg-[#F15A24] hover:bg-[#D14A14]"
                secondaryActionText="Cancel"
                additionalButtons={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (editingMember) {
                                handleRemove(editingMember);
                                setIsEditing(false);
                                setEditingMember(null);
                            }
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50 focus:ring-red-500 flex items-center justify-center"
                    >
                        Remove member
                    </Button>
                }
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <TextInput
                            label="First name"
                            value={newMember.firstName || (editingMember?.firstName || '')}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    firstName: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextInput
                            label="Last name"
                            value={newMember.lastName || (editingMember?.lastName || '')}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    lastName: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>
                    
                    <TextInput
                        label="Position / Title"
                        value={newMember.title || (editingMember?.title || '')}
                        onChange={(e) =>
                            setNewMember((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                        }
                        required
                    />

                    <TextArea
                        label="Brief Bio & Expertise"
                        value={newMember.detailedBiography || (editingMember?.detailedBiography || '')}
                        onChange={(e) =>
                            setNewMember((prev) => ({
                                ...prev,
                                detailedBiography: e.target.value,
                            }))
                        }
                        required
                    />

                    <SocialLinks
                        value={socialLinks}
                        onChange={setSocialLinks}
                    />
                </div>
            </ConfirmationModal>
        </div>
    );
};
