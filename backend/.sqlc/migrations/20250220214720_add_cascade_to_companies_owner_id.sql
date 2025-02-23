-- +goose Up
-- +goose StatementBegin
ALTER TABLE IF EXISTS companies
DROP CONSTRAINT companies_owner_id_fkey,
ADD CONSTRAINT companies_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Down migration just removes the on delete cascade while also keeping the fk rule
ALTER TABLE IF EXISTS companies
DROP CONSTRAINT companies_owner_id_fkey,
ADD CONSTRAINT companies_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id);
-- +goose StatementEnd
