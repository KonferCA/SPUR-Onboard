-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET TIME ZONE 'UTC';

CREATE TYPE project_status AS ENUM (
    'draft',
    'pending',
    'verified',
    'declined',
    'withdrawn'
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar UNIQUE NOT NULL,
    password char(256) NOT NULL,
    permissions integer NOT NULL DEFAULT 0,
    email_verified boolean NOT NULL DEFAULT false,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now()),
    token_salt bytea UNIQUE NOT NULL DEFAULT gen_random_bytes(32)
);

CREATE TABLE IF NOT EXISTS verify_email_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    expires_at bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES users(id),
    name varchar NOT NULL,
    wallet_address varchar,
    linkedin_url varchar NOT NULL,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE TABLE IF NOT EXISTS team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name varchar NOT NULL,
    last_name varchar NOT NULL,
    title varchar NOT NULL,
    bio varchar NOT NULL,
    linkedin_url varchar NOT NULL,
    is_account_owner boolean NOT NULL DEFAULT false,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    title varchar NOT NULL,
    description varchar,
    status project_status NOT NULL DEFAULT 'draft',
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE TABLE project_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question varchar NOT NULL,
    section varchar NOT NULL,
    input_type varchar(255) NOT NULL, -- the type of input the question is for frontend use.
    options varchar(255)[], -- optional options for inpyt types: checkbox, select, radio
    sub_section varchar NOT NULL,
    section_order int NOT NULL, -- defines the section order, aka step in the frontend
    sub_section_order int NOT NULL, -- defines in which order the sub-section is within the section
    question_order int NOT NULL, -- defines in which order the question appears in the sub-section
    required boolean NOT NULL DEFAULT false,
    validations varchar,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
); 

CREATE TABLE IF NOT EXISTS project_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES project_questions(id),
    answer varchar NOT NULL DEFAULT '',
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now()),
    UNIQUE(project_id, question_id)
);

CREATE TABLE IF NOT EXISTS project_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES project_questions(id) ON DELETE CASCADE,
    name varchar NOT NULL,
    url varchar NOT NULL,
    section varchar NOT NULL,
    sub_section varchar NOT NULL,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE TABLE IF NOT EXISTS project_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    target_id uuid NOT NULL,
    comment text NOT NULL,
    commenter_id uuid NOT NULL REFERENCES users(id),
    resolved boolean NOT NULL DEFAULT false,
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id),
    company_id uuid NOT NULL REFERENCES companies(id),
    tx_hash varchar NOT NULL,
    from_address varchar NOT NULL,
    to_address varchar NOT NULL,
    value_amount decimal(65,18) NOT NULL,
    created_by uuid NOT NULL REFERENCES users(id),
    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_project_answers_project ON project_answers(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_company ON team_members(company_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_team_members_company;
DROP INDEX IF EXISTS idx_transactions_company;
DROP INDEX IF EXISTS idx_transactions_project;
DROP INDEX IF EXISTS idx_project_answers_project;
DROP INDEX IF EXISTS idx_projects_company;
DROP INDEX IF EXISTS idx_companies_owner;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS project_comments;
DROP TABLE IF EXISTS project_documents;
DROP TABLE IF EXISTS project_answers;
DROP TABLE IF EXISTS project_questions;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS verify_email_tokens;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS project_status;
-- +goose StatementEnd
