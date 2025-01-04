// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: transactions.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const addTransaction = `-- name: AddTransaction :one
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
) RETURNING id, project_id, company_id, tx_hash, from_address, to_address, value_amount
`

type AddTransactionParams struct {
	ID          string
	ProjectID   string
	CompanyID   string
	TxHash      string
	FromAddress string
	ToAddress   string
	ValueAmount pgtype.Numeric
}

func (q *Queries) AddTransaction(ctx context.Context, arg AddTransactionParams) (Transaction, error) {
	row := q.db.QueryRow(ctx, addTransaction,
		arg.ID,
		arg.ProjectID,
		arg.CompanyID,
		arg.TxHash,
		arg.FromAddress,
		arg.ToAddress,
		arg.ValueAmount,
	)
	var i Transaction
	err := row.Scan(
		&i.ID,
		&i.ProjectID,
		&i.CompanyID,
		&i.TxHash,
		&i.FromAddress,
		&i.ToAddress,
		&i.ValueAmount,
	)
	return i, err
}
