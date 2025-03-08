-- +goose Up
-- +goose StatementBegin
ALTER TABLE team_members
ADD COLUMN social_links JSONB DEFAULT '[]'::jsonb;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE team_members
DROP COLUMN social_links;
-- +goose StatementEnd 