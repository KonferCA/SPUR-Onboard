-- name: CreateMeeting :one
INSERT INTO meetings (
    project_id,
    scheduled_by_user_id,
    start_time,
    end_time,
    meeting_url,
    location,
    notes
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: GetMeeting :one
SELECT * FROM meetings
WHERE id = $1 LIMIT 1;

-- name: ListMeetings :many
SELECT * FROM meetings
ORDER BY start_time DESC;

-- name: ListProjectMeetings :many
SELECT * FROM meetings
WHERE project_id = $1
ORDER BY start_time DESC;

-- name: UpdateMeeting :one
UPDATE meetings 
SET 
    start_time = $2,
    end_time = $3,
    meeting_url = $4,
    location = $5,
    notes = $6,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteMeeting :exec
DELETE FROM meetings 
WHERE id = $1;