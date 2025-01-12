-- name: AddTransaction :one
INSERT INTO transactions (
    id,
    project_id,
    company_id,
    tx_hash,
    from_address,
    to_address,
    value_amount
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *; 