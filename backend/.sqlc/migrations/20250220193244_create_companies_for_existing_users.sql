-- +goose Up
-- +goose StatementBegin
INSERT INTO companies (
    owner_id,
    name,
    linkedin_url,
    group_type
)
SELECT
    u.id,
    COALESCE(NULLIF(CONCAT(u.first_name, ' ', u.last_name), ' '), 'Unnamed Team'),
    COALESCE(u.linkedin, ''),
    'team'
FROM users u
WHERE NOT EXISTS (
    SELECT 1
    FROM companies c
    WHERE c.owner_id = u.id
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Do nothing since the created/updated companies shouldn't really be deleted.

-- +goose StatementEnd
