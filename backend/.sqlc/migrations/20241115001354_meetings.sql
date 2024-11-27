-- +goose Up
-- +goose StatementBegin
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    scheduled_by_user_id UUID NOT NULL REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    meeting_url TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meetings_project ON meetings(project_id);
CREATE INDEX idx_meetings_scheduler ON meetings(scheduled_by_user_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS meetings CASCADE;
-- +goose StatementEnd