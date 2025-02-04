-- name: GetUserByID :one
SELECT *
FROM users 
WHERE id = $1;

-- name: GetUserEmailVerifiedStatusByEmail :one
SELECT email_verified FROM users WHERE email = $1;

-- name: UserExistsByEmail :one
SELECT EXISTS(SELECT 1 FROM users WHERE email = $1);

-- name: NewUser :one
INSERT INTO users
(email, password, permissions)
VALUES
($1, $2, $3) RETURNING id, email, email_verified, permissions, token_salt;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1; 

-- name: UpdateUserEmailVerifiedStatus :exec
UPDATE users SET email_verified = $1 WHERE id = $2;

-- name: UpdateUserDetails :exec
UPDATE users
SET first_name = $1, last_name = $2, title = $3, bio = $4, linkedin = $5
WHERE id = $6;

-- name: GetUserDetails :one
SELECT 
    id,
    COALESCE(first_name, '') as first_name,
    COALESCE(last_name, '') as last_name,
    COALESCE(title, '') as title,
    COALESCE(bio, '') as bio,
    COALESCE(linkedin, '') as linkedin,
    COALESCE(created_at, EXTRACT(EPOCH FROM NOW())::bigint) as created_at,
    NULLIF(updated_at, 0)::bigint as updated_at
FROM users
WHERE id = $1;

-- name: ListUsers :many
SELECT 
    id,
    COALESCE(first_name, '') as first_name,
    COALESCE(last_name, '') as last_name,
    email,
    permissions,
    email_verified,
    created_at,
    updated_at
FROM users
WHERE 
    ($1::text IS NULL OR NULLIF($1, '')::int IS NULL OR permissions = NULLIF($1, '')::int) AND
    ($2::text IS NULL OR 
        (LOWER(email) LIKE '%' || LOWER($2) || '%' OR
         LOWER(COALESCE(first_name, '')) LIKE '%' || LOWER($2) || '%' OR
         LOWER(COALESCE(last_name, '')) LIKE '%' || LOWER($2) || '%'))
ORDER BY 
    CASE WHEN $3 = 'asc' THEN created_at END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN created_at END DESC
LIMIT $4 OFFSET $5;

-- name: CountUsers :one
SELECT COUNT(*)
FROM users
WHERE 
    ($1::text IS NULL OR NULLIF($1, '')::int IS NULL OR permissions = NULLIF($1, '')::int) AND
    ($2::text IS NULL OR 
        (LOWER(email) LIKE '%' || LOWER($2) || '%' OR
         LOWER(COALESCE(first_name, '')) LIKE '%' || LOWER($2) || '%' OR
         LOWER(COALESCE(last_name, '')) LIKE '%' || LOWER($2) || '%'));

-- name: UpdateUserRole :exec
UPDATE users
SET permissions = $2
WHERE id = $1;

-- name: UpdateUsersRole :exec
UPDATE users
SET permissions = $2
WHERE id = ANY($1::uuid[]);
