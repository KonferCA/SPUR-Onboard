/**
 * Permission flags matching backend permissions
 */
export const Permissions = {
    // Project Permissions
    PermViewAllProjects: 1 << 0, // Admin: view all projects (and companies?)
    PermReviewProjects: 1 << 1, // Admin: review/approve/decline projects
    PermManageUsers: 1 << 2, // Admin: manage user accounts
    PermManagePermissions: 1 << 3, // Admin: modify user permissions
    PermSubmitProject: 1 << 4, // Startup: submit projects for review
    PermCommentOnProjects: 1 << 5, // All: comment on projects
    PermInvestInProjects: 1 << 6, // Investor: invest in projects
    PermManageDocuments: 1 << 7, // Startup: manage project documents
    PermManageInvestments: 1 << 8, // Admin: manage investments
    PermManageTeam: 1 << 9, // Startup: manage team members
    PermIsAdmin: 1 << 10, // Special bit to identify admins
} as const;

/**
 * Checks if the user has all the specified permissions
 */
export function hasAllPermissions(
    userPermissions: number,
    ...requiredPermissions: number[]
): boolean {
    // Combine all required permissions into a single mask
    const requiredMask = requiredPermissions.reduce(
        (mask, perm) => mask | perm,
        0
    );
    // Check if all required bits are set in userPermissions
    return (userPermissions & requiredMask) === requiredMask;
}

/**
 * Checks if the user has any of the specified permissions
 */
export function hasAnyPermission(
    userPermissions: number,
    ...requiredPermissions: number[]
): boolean {
    return requiredPermissions.some(
        (permission) => (userPermissions & permission) !== 0
    );
}

/**
 * Checks if the user has admin permissions
 */
export function isAdmin(userPermissions: number): boolean {
    // For admin, we just need to check the admin bit lol
    return (
        (userPermissions & Permissions.PermIsAdmin) === Permissions.PermIsAdmin
    );
}

/**
 * Checks if the user has startup owner permissions
 */
export function isStartupOwner(userPermissions: number): boolean {
    return hasAllPermissions(
        userPermissions,
        Permissions.PermSubmitProject,
        Permissions.PermManageDocuments,
        Permissions.PermManageTeam,
        Permissions.PermCommentOnProjects
    );
}

/**
 * Checks if the user has investor permissions
 */
export function isInvestor(userPermissions: number): boolean {
    return hasAllPermissions(
        userPermissions,
        Permissions.PermViewAllProjects,
        Permissions.PermCommentOnProjects,
        Permissions.PermInvestInProjects
    );
}

/**
 * Gets an array of permission names that a user has
 */
export function getPermissionNames(userPermissions: number): string[] {
    return Object.entries(Permissions)
        .filter(([_, value]) => (userPermissions & value) === value)
        .map(([key]) => key);
}
