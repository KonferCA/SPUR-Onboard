-- +goose Up
-- +goose StatementBegin
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE company_question_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(company_id, question_id)
);

CREATE INDEX idx_company_answers_company ON company_question_answers(company_id);
CREATE INDEX idx_company_answers_question ON company_question_answers(question_id);

ALTER TABLE companies ADD COLUMN deleted_at TIMESTAMP;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX idx_company_answers_question;
DROP INDEX idx_company_answers_company;
DROP TABLE company_question_answers;
DROP TABLE questions;

ALTER TABLE companies DROP COLUMN deleted_at;
-- +goose StatementEnd