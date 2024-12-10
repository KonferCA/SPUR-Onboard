-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE project_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    section_id UUID NOT NULL REFERENCES project_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_sections_project ON project_sections(project_id);
CREATE INDEX idx_project_questions_section ON project_questions(section_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE project_questions;
DROP TABLE project_sections;
-- +goose StatementEnd 