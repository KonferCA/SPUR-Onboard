/**
 * Permission flags matching backend permissions
 */
export const Permissions = {
    // Project Permissions
    PermSubmitProject: 1 << 0,        // Startup: submit projects for review
    PermManageTeam: 1 << 1,           // Startup: manage team members
    PermViewAllProjects: 1 << 2,      // Admin/Investor: view all projects
    PermCommentOnProjects: 1 << 3,    // All: comment on projects
    PermInvestInProjects: 1 << 4,     // Investor: invest in projects
    PermReviewProjects: 1 << 5,       // Admin: review/approve/decline projects
    PermManageDocuments: 1 << 6,      // Startup: manage project documents
    PermManageInvestments: 1 << 7,    // Admin: manage investments
    
    // Admin permissions
    PermManageUsers: 1 << 28,         // Admin: manage user accounts
    PermManagePermissions: 1 << 29,   // Admin: modify user permissions
    PermManageSystem: 1 << 30,        // Admin: system management
    PermAdmin: 1 << 31,               // Admin: special bit to identify admins
} as const;

/**
 * Checks if the user has all the specified permissions
 */
export function hasAllPermissions(userPermissions: number, ...requiredPermissions: number[]): boolean {
    // Combine all required permissions into a single mask
    const requiredMask = requiredPermissions.reduce((mask, perm) => mask | perm, 0);
    // Check if all required bits are set in userPermissions
    return (userPermissions & requiredMask) === requiredMask;
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
    // For admin, we just need to check the admin bit lol
    return (userPermissions & Permissions.PermAdmin) === Permissions.PermAdmin;
}

/**
 * Checks if the user has startup owner permissions
 */
export function isStartupOwner(userPermissions: number): boolean {
    return hasAllPermissions(userPermissions,
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
    return hasAllPermissions(userPermissions,
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