-- name: CreateFundingTransaction :one
INSERT INTO funding_transactions (
    project_id,
    amount,
    currency,
    transaction_hash,
    from_wallet_address,
    to_wallet_address,
    status
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: GetFundingTransaction :one
SELECT * FROM funding_transactions
WHERE id = $1 LIMIT 1;

-- name: ListFundingTransactions :many
SELECT * FROM funding_transactions
ORDER BY created_at DESC;

-- name: ListProjectFundingTransactions :many
SELECT * FROM funding_transactions
WHERE project_id = $1
ORDER BY created_at DESC;

-- name: UpdateFundingTransactionStatus :one
UPDATE funding_transactions
SET 
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteFundingTransaction :exec
DELETE FROM funding_transactions
WHERE id = $1;