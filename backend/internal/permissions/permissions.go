package permissions

// Permission flags using bitwise operations
const (
    // Project Permissions
    PermViewAllProjects    uint32 = 1 << 0  // Admin: view all projects (and companies?)
    PermReviewProjects     uint32 = 1 << 1  // Admin: review/approve/decline projects
    PermManageUsers        uint32 = 1 << 3  // Admin: manage user accounts
    PermManagePermissions  uint32 = 1 << 4  // Admin: modify user permissions
    PermSubmitProject      uint32 = 1 << 5  // Startup: submit projects for review
    PermCommentOnProjects  uint32 = 1 << 6  // Investor: comment on projects
    PermInvestInProjects   uint32 = 1 << 7  // Investor: invest in projects
    PermManageDocuments    uint32 = 1 << 8  // Startup: manage project documents
    
    // Role-based permission sets
    PermAdmin = PermViewAllProjects | PermReviewProjects | 
                PermManageUsers | PermManagePermissions | PermCommentOnProjects

    PermStartupOwner = PermSubmitProject | PermCommentOnProjects | PermManageDocuments

    PermInvestor = PermViewAllProjects | PermCommentOnProjects | PermInvestInProjects
)

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