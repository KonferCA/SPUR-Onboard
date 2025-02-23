-- +goose Up
-- +goose StatementBegin
CREATE TYPE social_platform_enum AS ENUM (
    'linkedin',
    'instagram',
    'facebook',
    'bluesky',
    'x',
    'discord',
    'custom_url'
);

CREATE TABLE IF NOT EXISTS user_socials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform social_platform_enum NOT NULL,
    url_or_handle TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL DEFAULT extract(epoch from now()),
    updated_at BIGINT NOT NULL DEFAULT extract(epoch from now())
);

CREATE TRIGGER update_user_socials_updated_at
    BEFORE UPDATE
    ON user_socials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_user_socials_updated_at ON user_socials;
DROP TABLE IF EXISTS user_socials;
DROP TYPE IF EXISTS social_platform_enum;
-- +goose StatementEnd
