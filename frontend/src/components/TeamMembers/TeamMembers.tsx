import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Button, TextArea, TextInput } from '@components';
import type { TeamMember } from '@/types';

export interface TeamMembersProps {
    value: TeamMember[];
    onChange: (members: TeamMember[]) => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
    value = [],
    onChange,
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newMember, setNewMember] = useState<Partial<TeamMember>>({});

    const checkAllRequired = () => {
        return (
            newMember.firstName &&
            newMember.lastName &&
            newMember.title &&
            newMember.linkedin &&
            (newMember.resumeInternalUrl || newMember.resumeExternalUrl) &&
            newMember.personalWebsite &&
            newMember.commitmentType &&
            newMember.introduction &&
            newMember.industryExperience &&
            newMember.detailedBiography
        );
    };

    const handleAdd = () => {
        if (checkAllRequired()) {
            const member: TeamMember = {
                id: Math.random().toString(36).substring(2, 9),
                firstName: newMember.firstName!,
                lastName: newMember.lastName!,
                title: newMember.title!,
                detailedBiography: newMember.detailedBiography!,
                linkedin: newMember.linkedin!,
                resumeExternalUrl: newMember.resumeExternalUrl || '',
                resumeInternalUrl: newMember.resumeInternalUrl || '',
                personalWebsite: newMember.personalWebsite!,
                introduction: newMember.introduction!,
                commitmentType: newMember.commitmentType!,
                industryExperience: newMember.industryExperience!,
                previousWork: newMember.previousWork || '',
                founderAgreementExternalUrl:
                    newMember.founderAgreementExternalUrl || '',
                founderAgreementInternalUrl:
                    newMember.founderAgreementInternalUrl || '',
                isAccountOwner: false,
            };
            onChange([...value, member]);
            setNewMember({});
            setIsAdding(false);
        }
    };

    const handleRemove = (id: string) => {
        onChange(value.filter((member) => member.id !== id));
    };

    return (
        <div className="space-y-4">
            {/* Member List */}
            <div className="grid grid-cols-2 gap-4">
                {value.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                            {[member.firstName[0], member.lastName[0]].join('')}
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                            <div className="font-medium truncate">
                                {[member.firstName, member.lastName].join(' ')}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                                {member.title}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleRemove(member.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Member Form */}
            {isAdding ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4 border-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <TextInput
                                label="First Name"
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
                                label="Last Name"
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
                            label="Position/Title"
                            value={newMember.title || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextInput
                            label="LinkedIn Profile"
                            value={newMember.linkedin || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    linkedin: e.target.value,
                                }))
                            }
                            required
                        />
                        <fieldset>
                            <div className="flex justify-between items-center mb-1">
                                <legend className="block text-md font-normal">
                                    Resume or CV
                                </legend>
                                <span className="text-sm text-gray-500">
                                    Required
                                </span>
                            </div>
                            <div className="space-y-4">
                                <TextInput
                                    value={newMember.resumeExternalUrl || ''}
                                    onChange={(e) =>
                                        setNewMember((prev) => ({
                                            ...prev,
                                            resumeExternalUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="Provide a link or upload directly"
                                    required
                                />
                                {/* TODO: Add file upload here */}
                            </div>
                        </fieldset>
                        <TextInput
                            label="Personal website or portfolio URL"
                            value={newMember.personalWebsite || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    personalWebsite: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextInput
                            label="How committed is this person (e.g., full-time, personal investment)?"
                            value={newMember.commitmentType || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    commitmentType: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextInput
                            label="Give a brief introduction as to who this person is and what their background and expertise are."
                            value={newMember.introduction || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    introduction: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextArea
                            label="Does this person have relevant experience in the industry?"
                            value={newMember.industryExperience || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    industryExperience: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextArea
                            label="Give a detailed biography of this person, outlining roles, responsibilities, and key achievements."
                            value={newMember.detailedBiography || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    detailedBiography: e.target.value,
                                }))
                            }
                            required
                        />
                        <TextInput
                            label="Are there any examples of previous work or case studies from past ventures that this person has participated in?"
                            value={newMember.previousWork || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    previousWork: e.target.value,
                                }))
                            }
                        />
                        <fieldset>
                            <div className="flex justify-between items-center mb-1">
                                <legend className="block text-md font-normal">
                                    Is there a founder's agreement in place that
                                    outlines roles, responsibilities, equity
                                    split, and dispute resolution mechanisms?
                                </legend>
                            </div>
                            <div className="space-y-4">
                                <TextInput
                                    value={
                                        newMember.founderAgreementExternalUrl ||
                                        ''
                                    }
                                    onChange={(e) =>
                                        setNewMember((prev) => ({
                                            ...prev,
                                            founderAgreementExternalUrl:
                                                e.target.value,
                                        }))
                                    }
                                    placeholder="Provide a link or upload directly"
                                    required
                                />
                                {/* TODO: Add file upload here */}
                            </div>
                        </fieldset>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsAdding(false);
                                setNewMember({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={handleAdd}>
                            Add Member
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
                >
                    <FiPlus />
                    Add member
                </button>
            )}
        </div>
    );
};
