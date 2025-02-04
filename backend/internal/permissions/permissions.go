package permissions

// Permission flags using bitwise operations
const (
    // Project Permissions
    PermViewAllProjects    uint32 = 1 << iota  // Admin: view all projects (and companies?)
    PermReviewProjects                         // Admin: review/approve/decline projects
    PermManageUsers                            // Admin: manage user accounts
    PermManagePermissions                      // Admin: modify user permissions
    PermSubmitProject                          // Startup: submit projects for review
    PermCommentOnProjects                      // Investor: comment on projects
    PermInvestInProjects                       // Investor: invest in projects
    PermManageDocuments                        // Startup: manage project documents
    PermManageInvestments                      // Admin: manage investments
    PermManageTeam                             // Startup: manage team members
    PermIsAdmin                                // Special bit to identify admins
    
    // This will be 2^(number of permissions) - 1, making a mask of all valid bits (POG)
    validPermissionBits = (1 << (iota)) - 1
)

// Role-based permission sets
const (
    PermAdmin = PermIsAdmin | PermViewAllProjects | PermReviewProjects | 
                PermManageUsers | PermManagePermissions | PermCommentOnProjects

    PermStartupOwner = PermSubmitProject | PermCommentOnProjects | PermManageDocuments | PermManageTeam

    PermInvestor = PermViewAllProjects | PermCommentOnProjects | PermInvestInProjects

    PermRegular uint32 = 0 // This is a placeholder for the new role
)

// GetAllPermissionBits returns a mask containing all valid permission bits.
// This is used for validation to ensure no invalid bits are set.
func GetAllPermissionBits() uint32 {
    return validPermissionBits
}

// Helper functions for permission checking
func HasPermission(userPerms, requiredPerm uint32) bool {
    return userPerms&requiredPerm != 0
}

func HasAllPermissions(userPerms uint32, requiredPerms ...uint32) bool {
    for _, perm := range requiredPerms {
        if !HasPermission(userPerms, perm) {
            return false
        }
    }
    return true
}

func HasAnyPermission(userPerms uint32, requiredPerms ...uint32) bool {
    for _, perm := range requiredPerms {
        if HasPermission(userPerms, perm) {
            return true
        }
    }
    return false
} 