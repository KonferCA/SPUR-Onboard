import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Button, TextInput } from '@components';
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

    const handleAdd = () => {
        if (newMember.firstName && newMember.lastName && newMember.title) {
            const member: TeamMember = {
                id: Math.random().toString(36).substring(2, 9),
                firstName: newMember.firstName,
                lastName: newMember.lastName,
                title: newMember.title,
                bio: newMember.bio || '',
                linkedin: newMember.linkedin || '',
            };
            onChange([...value, member]);
            setNewMember({});
            setIsAdding(false);
        }
    };

    const handleRemove = (id: string) => {
        onChange(value.filter((member) => member.id !== id));
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
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
                            {getInitials(
                                [member.firstName, member.lastName].join(' ')
                            )}
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
                            label="Brief Bio & Expertise"
                            value={newMember.bio || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    bio: e.target.value,
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
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsAdding(false);
                                setNewMember({});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleAdd}>
                            Add Member
                        </Button>
                    </div>
                </div>
            ) : (
                <button
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
