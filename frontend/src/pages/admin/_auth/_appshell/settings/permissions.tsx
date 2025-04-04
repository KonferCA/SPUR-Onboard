import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUsers,
    updateUserRole,
    updateUsersRole,
    type User,
} from '@/services/users';
import { useNotification } from '@/contexts/NotificationContext';

export const Route = createFileRoute(
    '/admin/_auth/_appshell/settings/permissions'
)({
    component: PermissionsPage,
});

function PermissionsPage() {
    const { accessToken, isLoading: authLoading } = useAuth();
    const { push } = useNotification();
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Role definitions with their permissions
    const roles = {
        admin: {
            label: 'Admin',
            count: users.filter((u) => u.role === 'admin').length,
            permissions: [
                'Manage other users',
                'Manage projects',
                'All Investor Permissions',
                'All Regular Permissions',
            ],
        },
        investor: {
            label: 'Investor',
            count: users.filter((u) => u.role === 'investor').length,
            permissions: [
                'Fund projects',
                'View project submissions',
                'Request changes & leave comments on projects',
                'Approve projects',
            ],
        },
        regular: {
            label: 'Regular',
            count: users.filter((u) => u.role === 'regular').length,
            permissions: [
                'Create projects',
                'Edit projects',
                'Submit projects',
            ],
        },
    };

    useEffect(() => {
        if (authLoading || !accessToken) return;

        const token = accessToken;

        async function fetchUsers() {
            try {
                setIsLoading(true);
                const result = await getUsers(token, {
                    role: selectedRole,
                    search: searchQuery,
                    sortBy: 'date_joined',
                    sortOrder,
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                });
                setUsers(result.users);
                setTotalUsers(result.total);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                push({
                    message: 'Failed to fetch users',
                    level: 'error',
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();
    }, [
        accessToken,
        authLoading,
        selectedRole,
        searchQuery,
        sortOrder,
        currentPage,
        push,
    ]);

    const handleRoleChange = async (
        userId: string,
        newRole: 'admin' | 'investor' | 'regular'
    ) => {
        if (!accessToken) return;

        const token = accessToken;

        try {
            await updateUserRole(token, userId, { role: newRole });
            // Refresh users list after successful update
            const result = await getUsers(token, {
                role: selectedRole,
                search: searchQuery,
                sortBy: 'date_joined',
                sortOrder,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setUsers(result.users);
            push({
                message: 'User role updated successfully',
                level: 'success',
            });
        } catch (error) {
            console.error('Failed to update user role:', error);
            push({
                message: 'Failed to update user role',
                level: 'error',
            });
        }
    };

    const handleBulkRoleUpdate = async (
        newRole: 'admin' | 'investor' | 'regular'
    ) => {
        if (selectedUsers.length === 0 || !accessToken) return;

        const token = accessToken;

        try {
            await updateUsersRole(token, selectedUsers, { role: newRole });
            // Refresh users list after successful update
            const result = await getUsers(token, {
                role: selectedRole,
                search: searchQuery,
                sortBy: 'date_joined',
                sortOrder,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setUsers(result.users);
            setSelectedUsers([]);
            push({
                message: 'User roles updated successfully',
                level: 'success',
            });
        } catch (error) {
            console.error('Failed to update user roles:', error);
            push({
                message: 'Failed to update user roles',
                level: 'error',
            });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedUsers(checked ? users.map((u) => u.id) : []);
    };

    const handleSelectUser = (userId: string, checked: boolean) => {
        setSelectedUsers((prev) =>
            checked ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
    };

    if (authLoading) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!accessToken) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-red-500">Not authenticated</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 pt-16 md:pt-20 max-w-6xl mx-auto w-full">
            <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Manage <span className="text-[#F4802F]">Permissions</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                    Manage user roles and permissions across the platform
                </p>
            </div>

            <hr className="mb-6 md:mb-8 border-gray-200" />

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Role Filter */}
                <div className="relative w-full sm:w-auto">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="appearance-none w-full sm:w-auto bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                    >
                        <option value="all">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="investor">Investor</option>
                        <option value="regular">Regular</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Date Filter */}
                <div className="relative w-full sm:w-auto">
                    <select
                        value={sortOrder}
                        onChange={(e) =>
                            setSortOrder(e.target.value as 'asc' | 'desc')
                        }
                        className="appearance-none w-full sm:w-auto bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                    >
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-auto sm:ml-auto">
                    <input
                        type="text"
                        placeholder="Search users"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {Object.entries(roles).map(([key, role]) => (
                    <div
                        key={key}
                        className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:border-[#F4802F] hover:shadow-sm transition-all duration-300"
                    >
                        <div className="mb-3 md:mb-4">
                            <h3 className="text-xl md:text-2xl font-medium">
                                {role.label}
                            </h3>
                            <div className="text-xs md:text-sm text-gray-500 mt-1">
                                {role.count} Users
                            </div>
                        </div>
                        <ul className="space-y-1 md:space-y-2">
                            {role.permissions.map((permission) => (
                                <li
                                    key={permission}
                                    className="text-xs md:text-sm text-gray-600"
                                >
                                    • {permission}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-3 md:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#F4802F] focus:ring-[#F4802F]"
                                        checked={
                                            selectedUsers.length ===
                                                users.length && users.length > 0
                                        }
                                        onChange={(e) =>
                                            handleSelectAll(e.target.checked)
                                        }
                                    />
                                </th>
                                <th className="px-3 md:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-3 md:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Joined
                                </th>
                                <th className="px-3 md:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 md:px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 md:px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-[rgba(255,194,152,0.1)] transition-colors duration-200"
                                    >
                                        <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#F4802F] focus:ring-[#F4802F]"
                                                checked={selectedUsers.includes(
                                                    user.id
                                                )}
                                                onChange={(e) =>
                                                    handleSelectUser(
                                                        user.id,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border border-gray-200">
                                                    {user.firstName
                                                        ? user.firstName[0]
                                                        : ''}
                                                    {user.lastName
                                                        ? user.lastName[0]
                                                        : ''}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.firstName}{' '}
                                                        {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(
                                                user.dateJoined
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        user.id,
                                                        e.target.value as
                                                            | 'admin'
                                                            | 'investor'
                                                            | 'regular'
                                                    )
                                                }
                                                className="text-sm border border-gray-200 rounded-md focus:ring-[#F4802F] focus:border-[#F4802F] transition-all duration-300"
                                            >
                                                <option value="regular">
                                                    Regular
                                                </option>
                                                <option value="investor">
                                                    Investor
                                                </option>
                                                <option value="admin">
                                                    Admin
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-3 md:px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F4802F] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="mx-2 text-xs text-gray-700">
                            Page {currentPage} of{' '}
                            {Math.ceil(totalUsers / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            disabled={
                                currentPage * ITEMS_PER_PAGE >= totalUsers
                            }
                            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F4802F] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">
                                    {Math.min(
                                        (currentPage - 1) * ITEMS_PER_PAGE + 1,
                                        totalUsers
                                    )}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(
                                        currentPage * ITEMS_PER_PAGE,
                                        totalUsers
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {totalUsers}
                                </span>{' '}
                                results
                            </p>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-[#F4802F] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({
                                    length: Math.ceil(
                                        totalUsers / ITEMS_PER_PAGE
                                    ),
                                }).map((_, i) => (
                                    <button
                                        type="button"
                                        // biome-ignore lint: array does not have any defined value, so using index as key
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border ${
                                            currentPage === i + 1
                                                ? 'z-10 bg-[rgba(255,194,152,0.3)] border-[#F4802F] text-[#F4802F]'
                                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                        } text-sm font-medium`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((prev) => prev + 1)
                                    }
                                    disabled={
                                        currentPage * ITEMS_PER_PAGE >=
                                        totalUsers
                                    }
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-[#F4802F] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="fixed bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 md:gap-3 bg-white px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg border border-[#F4802F] max-w-[calc(100%-2rem)] md:max-w-[calc(100%-4rem)]">
                    <span className="text-xs md:text-sm text-gray-600 mr-1 md:mr-2">
                        {selectedUsers.length} user
                        {selectedUsers.length > 1 ? 's' : ''} selected
                    </span>
                    <button
                        type="button"
                        onClick={() => handleBulkRoleUpdate('admin')}
                        className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-[rgba(255,194,152,0.2)] hover:border-[#F4802F] hover:text-[#F4802F] transition-all duration-300"
                    >
                        Make Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => handleBulkRoleUpdate('investor')}
                        className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-[rgba(255,194,152,0.2)] hover:border-[#F4802F] hover:text-[#F4802F] transition-all duration-300"
                    >
                        Make Investor
                    </button>
                    <button
                        type="button"
                        onClick={() => handleBulkRoleUpdate('regular')}
                        className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-[rgba(255,194,152,0.2)] hover:border-[#F4802F] hover:text-[#F4802F] transition-all duration-300"
                    >
                        Make Regular
                    </button>
                </div>
            )}
        </div>
    );
}
