/**
 * Permission flags matching backend permissions
 */
export const Permissions = {
    // Basic permissions
    PermSubmitProject: 1 << 0,
    PermManageTeam: 1 << 1,
    PermViewAllProjects: 1 << 2,
    PermCommentOnProjects: 1 << 3,
    PermInvestInProjects: 1 << 4,
    
    // Admin permissions
    PermManageUsers: 1 << 28,
    PermManagePermissions: 1 << 29,
    PermManageSystem: 1 << 30,
    PermAdmin: 1 << 31,
} as const;

/**
 * Checks if the user has all the specified permissions
 */
export function hasAllPermissions(userPermissions: number, ...requiredPermissions: number[]): boolean {
    return requiredPermissions.every(permission => (userPermissions & permission) === permission);
}

/**
 * Checks if the user has any of the specified permissions
 */
export function hasAnyPermission(userPermissions: number, ...requiredPermissions: number[]): boolean {
    return requiredPermissions.some(permission => (userPermissions & permission) !== 0);
}

/**
 * Checks if the user has admin permissions
 */
export function isAdmin(userPermissions: number): boolean {
    return (userPermissions & Permissions.PermAdmin) === Permissions.PermAdmin;
}

/**
 * Gets an array of permission names that a user has
 */
export function getPermissionNames(userPermissions: number): string[] {
    return Object.entries(Permissions)
        .filter(([_, value]) => (userPermissions & value) === value)
        .map(([key]) => key);
} 