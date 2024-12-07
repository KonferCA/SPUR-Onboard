-- +goose Up
-- +goose StatementBegin

-- clean up any existing seed accounts
DELETE FROM users WHERE email IN ('admin@spur.com', 'startup@test.com', 'investor@test.com');

-- create admin user
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    email_verified,
    token_salt
) VALUES (
    'admin@spur.com',
    -- hash for 'admin123'
    '$2a$10$jltnaECAYSCQozp5UNZi7OZQlyuTR3sJFj5Hr1nLEVmI9uSAxDKnq',
    'Admin',
    'User',
    'admin',
    true,
    gen_random_bytes(32)
);

-- create startup owner
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    email_verified,
    token_salt
) VALUES (
    'startup@test.com',
    -- hash for 'startup123'
    '$2a$10$Cu72xg8m59GjDHKiFzK7pO8rLYjFL7XsPD6YezNkyZw8ItZBSnvfy',
    'Startup',
    'Owner',
    'startup_owner',
    true,
    gen_random_bytes(32)
);

-- create investor
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    email_verified,
    token_salt
) VALUES (
    'investor@test.com',
    -- hash for 'investor123'
    '$2a$10$/7Mq7D4hlh0zisjOryL.KeeWSUU30tL5mJdYLAjcqeOodSPrbB.hK',
    'Test',
    'Investor',
    'investor',
    true,
    gen_random_bytes(32)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM users WHERE email IN ('admin@spur.com', 'startup@test.com', 'investor@test.com');
-- +goose StatementEnd 