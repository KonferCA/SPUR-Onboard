-- name: CreateInvestmentIntention :one
INSERT INTO investment_intentions (
    id,
    project_id,
    investor_id,
    intended_amount,
    status,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5,
    extract(epoch from now()),
    extract(epoch from now())
) RETURNING *;

-- name: GetInvestmentIntentionsByProject :many
SELECT 
    ii.*,
    u.first_name as investor_first_name,
    u.last_name as investor_last_name,
    u.email as investor_email
FROM investment_intentions ii
JOIN users u ON ii.investor_id = u.id
WHERE ii.project_id = $1
ORDER BY ii.created_at DESC;

-- name: GetInvestmentIntentionsByInvestor :many
SELECT 
    ii.*,
    p.title as project_title,
    c.name as company_name
FROM investment_intentions ii
JOIN projects p ON ii.project_id = p.id
JOIN companies c ON p.company_id = c.id
WHERE ii.investor_id = $1
ORDER BY ii.created_at DESC;

-- name: GetInvestmentIntentionByID :one
SELECT 
    ii.*,
    u.first_name as investor_first_name,
    u.last_name as investor_last_name,
    u.email as investor_email,
    p.title as project_title,
    c.name as company_name
FROM investment_intentions ii
JOIN users u ON ii.investor_id = u.id
JOIN projects p ON ii.project_id = p.id
JOIN companies c ON p.company_id = c.id
WHERE ii.id = $1;

-- name: UpdateInvestmentIntentionStatus :one
UPDATE investment_intentions
SET 
    status = $2,
    transaction_hash = $3,
    updated_at = extract(epoch from now())
WHERE id = $1
RETURNING *;

-- name: UpdateInvestmentIntentionAmount :one
UPDATE investment_intentions
SET 
    intended_amount = $2,
    updated_at = extract(epoch from now())
WHERE id = $1
RETURNING *;

-- name: DeleteInvestmentIntention :exec
DELETE FROM investment_intentions
WHERE id = $1;

-- name: GetInvestmentIntentionsByProjectAndInvestor :one
SELECT *
FROM investment_intentions
WHERE project_id = $1 AND investor_id = $2;

-- name: GetTotalInvestmentIntentionsForProject :one
SELECT 
    COALESCE(SUM(intended_amount), 0) as total_amount,
    COUNT(*) as total_count
FROM investment_intentions
WHERE project_id = $1 AND status != 'cancelled';

-- name: GetInvestmentIntentionsByStatus :many
SELECT 
    ii.*,
    u.first_name as investor_first_name,
    u.last_name as investor_last_name,
    u.email as investor_email,
    p.title as project_title,
    c.name as company_name
FROM investment_intentions ii
JOIN users u ON ii.investor_id = u.id
JOIN projects p ON ii.project_id = p.id
JOIN companies c ON p.company_id = c.id
WHERE ii.status = $1
ORDER BY ii.created_at DESC;

-- name: BulkUpdateInvestmentIntentionStatus :exec
UPDATE investment_intentions
SET 
    status = $2,
    updated_at = extract(epoch from now())
WHERE project_id = $1 AND status = $3; 