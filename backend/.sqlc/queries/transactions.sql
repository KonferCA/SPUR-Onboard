-- name: AddTransaction :one
INSERT INTO transactions (
    id,
    project_id,
    company_id,
    tx_hash,
    from_address,
    to_address,
    value_amount,
    created_by,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    extract(epoch from now()),
    extract(epoch from now())
) RETURNING *;