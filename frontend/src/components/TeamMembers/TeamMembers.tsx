import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { Button } from '@components';
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
        if (newMember.name && newMember.role) {
            const member: TeamMember = {
                id: Math.random().toString(36).substring(2, 9),
                name: newMember.name,
                role: newMember.role,
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
                            {getInitials(member.name)}
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                            <div className="font-medium truncate">
                                {member.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                                {member.role}
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
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newMember.name || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            value={newMember.role || ''}
                            onChange={(e) =>
                                setNewMember((prev) => ({
                                    ...prev,
                                    role: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
