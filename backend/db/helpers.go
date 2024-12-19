package db

import "github.com/jackc/pgx/v5"

/*
Check if the returned error from a query that is expecting row(s) but none returned.
*/
func IsNoRowsErr(err error) bool {
	return err == pgx.ErrNoRows
}
