-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
ADD COLUMN profile_picture_url TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
DROP COLUMN profile_picture_url;
-- +goose StatementEnd 