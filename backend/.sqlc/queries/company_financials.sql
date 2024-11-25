-- name: CreateCompanyFinancials :one
INSERT INTO company_financials (
    id,
    company_id,
    financial_year,
    revenue,
    expenses,
    profit,
    sales,
    amount_raised,
    arr,
    grants_received,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING *;

-- name: GetCompanyFinancialsByYear :one
SELECT *
FROM company_financials
WHERE company_id = $1 
AND financial_year = $2
LIMIT 1;

-- name: ListCompanyFinancials :many
SELECT *
FROM company_financials
WHERE company_id = $1
ORDER BY financial_year DESC;

-- name: UpdateCompanyFinancials :one
UPDATE company_financials
SET 
    revenue = $3,
    expenses = $4,
    profit = $5,
    sales = $6,
    amount_raised = $7,
    arr = $8,
    grants_received = $9,
    updated_at = CURRENT_TIMESTAMP
WHERE company_id = $1 
AND financial_year = $2
RETURNING *;

-- name: DeleteCompanyFinancials :exec
DELETE FROM company_financials
WHERE company_id = $1 
AND financial_year = $2;

-- name: GetLatestCompanyFinancials :one
SELECT *
FROM company_financials
WHERE company_id = $1
ORDER BY financial_year DESC
LIMIT 1;