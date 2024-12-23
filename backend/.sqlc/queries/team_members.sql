-- name: CreateTeamMember :one
INSERT INTO team_members (
    id, company_id, first_name, last_name, 
    title, bio, linkedin_url, is_account_owner
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *; 

-- name: ListTeamMembers :many
SELECT * FROM team_members 
WHERE company_id = $1 
ORDER BY created_at DESC; 

-- name: GetTeamMember :one
SELECT * FROM team_members 
WHERE id = $1 AND company_id = $2 
LIMIT 1; 

-- name: UpdateTeamMember :one
UPDATE team_members 
SET 
    first_name = COALESCE(NULLIF(@first_name::text, ''), first_name),
    last_name = COALESCE(NULLIF(@last_name::text, ''), last_name),
    title = COALESCE(NULLIF(@title::text, ''), title),
    bio = COALESCE(NULLIF(@bio::text, ''), bio),
    linkedin_url = COALESCE(NULLIF(@linkedin_url::text, ''), linkedin_url),
    updated_at = extract(epoch from now())
WHERE id = @id AND company_id = @company_id
RETURNING *;

-- name: DeleteTeamMember :exec
DELETE FROM team_members 
WHERE id = $1 AND company_id = $2; 