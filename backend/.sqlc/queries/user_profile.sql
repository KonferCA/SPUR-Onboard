-- name: CreateUserProfile :one
INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    position,
    role,
    bio,
    expertise,
    is_profile_complete
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING *;

-- name: GetUserProfileByUserID :one
SELECT * FROM user_profiles
WHERE user_id = $1;

-- name: UpdateUserProfile :one
UPDATE user_profiles
SET
    first_name = $2,
    last_name = $3,
    position = $4,
    role = $5,
    bio = $6,
    expertise = $7,
    is_profile_complete = $8
WHERE user_id = $1
RETURNING *;

-- name: DeleteUserProfile :exec
DELETE FROM user_profiles
WHERE user_id = $1;

-- name: CheckProfileComplete :one
SELECT is_profile_complete, role
FROM user_profiles
WHERE user_id = $1;

-- name: ListUserProfilesByRole :many
SELECT p.*, u.email
FROM user_profiles p
JOIN users u ON p.user_id = u.id
WHERE p.role = $1 AND p.is_profile_complete = true
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListAllCompleteProfiles :many
SELECT p.*, u.email
FROM user_profiles p
JOIN users u ON p.user_id = u.id
WHERE p.is_profile_complete = true
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;