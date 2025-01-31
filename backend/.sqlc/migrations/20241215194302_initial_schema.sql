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
    -- company_stages text[] NOT NULL,
    -- investement_stage text,
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
    personal_website TEXT,
    commitment_type TEXT NOT NULL,
    introduction TEXT NOT NULL,
    industy_experience TEXT NOT NULL,
    detailed_biography TEXT NOT NULL,
    previous_work TEXT,
    resume_external_url TEXT,
    resume_internal_url TEXT, -- s3 url
    founders_agreement_external_url TEXT,
    founders_agreement_internal_url TEXT, -- s3 url
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

CREATE TYPE input_type_enum AS ENUM (
    'url',
    'file',
    'textarea',
    'textinput',
    'select',
    'multiselect',
    'team',
    'date'
);

CREATE TYPE condition_type_enum AS ENUM (
    'not_empty',
    'empty',
    'equals',
    'contains'
);

CREATE TABLE project_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    question text NOT NULL,

    section text NOT NULL,
    sub_section text NOT NULL,

    section_order int NOT NULL, -- defines the section order, aka step in the frontend
    sub_section_order int NOT NULL, -- defines in which order the sub-section is within the section
    question_order int NOT NULL, -- defines in which order the question appears in the sub-section


    -- conditional rendering
    condition_type condition_type_enum, -- 'empty', 'not_empty', 'equals', 'contains'
    condition_value text, -- Optional, only needed for specific condition types
    dependent_question_id uuid REFERENCES project_questions(id) ON DELETE SET NULL,

    validations text[],

    -- grouping inputs for the same question together
    -- it points to the first question, e.x: upload file or provide url then the provide url input has the uuid of upload file input
    question_group_id uuid REFERENCES project_questions(id) ON DELETE SET NULL,

    -- input properties
    input_type input_type_enum NOT NULL,
    options varchar(255)[], -- For input types that need options
    required boolean NOT NULL DEFAULT false,
    placeholder text,
    description text,
    disabled boolean NOT NULL DEFAULT false,

    created_at bigint NOT NULL DEFAULT extract(epoch from now()),
    updated_at bigint NOT NULL DEFAULT extract(epoch from now())
);

CREATE TABLE IF NOT EXISTS project_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES project_questions(id) ON DELETE CASCADE,
    answer text NOT NULL DEFAULT '',
    choices text[],
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
    mime_type varchar NOT NULL,
    size bigint NOT NULL DEFAULT 0,
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
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS input_type_enum;
DROP TYPE IF EXISTS condition_type_enum;
-- +goose StatementEnd
