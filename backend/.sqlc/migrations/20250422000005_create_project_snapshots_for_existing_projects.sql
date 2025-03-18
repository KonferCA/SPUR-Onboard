-- +goose Up
-- +goose StatementBegin
INSERT INTO project_snapshots (id, project_id, data, version_number, title, parent_snapshot_id, created_at)
SELECT
    gen_random_uuid(), -- Generate a new UUID for the snapshot id
    p.id, -- project_id
    jsonb_build_object(
        'questions', (
            SELECT coalesce(jsonb_agg(
                jsonb_build_object(
                    'id', pq.id::text,
                    'question', pq.question,
                    'section', pq.section,
                    'sub_section', pq.sub_section,
                    'section_order', pq.section_order,
                    'sub_section_order', pq.sub_section_order,
                    'question_order', pq.question_order,
                    'condition_type', pq.condition_type::text,
                    'condition_value', pq.condition_value,
                    'dependent_question_id', pq.dependent_question_id::text,
                    'validations', (
                        CASE
                            WHEN pq.validations IS NULL THEN '[]'::jsonb
                            WHEN pq.validations::text = '{}' THEN '[]'::jsonb
                            ELSE to_jsonb(pq.validations)
                        END
                    ),
                    'question_group_id', pq.question_group_id::text,
                    'input_type', pq.input_type::text,
                    'options', (
                        CASE
                            WHEN pq.options IS NULL THEN '[]'::jsonb
                            WHEN pq.options::text = '{}' THEN '[]'::jsonb
                            ELSE to_jsonb(pq.options)
                        END
                    ),
                    'required', pq.required,
                    'placeholder', pq.placeholder,
                    'description', pq.description,
                    'disabled', pq.disabled,
                    'created_at', pq.created_at,
                    'updated_at', pq.updated_at,
                    'question_key', pq.question_key,
                    'input_props', pq.input_props,
                    'answer', coalesce(pa.answer, ''),
                    'choices', (
                        CASE
                            WHEN pa.choices IS NULL THEN '[]'::jsonb
                            WHEN pa.choices::text = '{}' THEN '[]'::jsonb
                            ELSE to_jsonb(pa.choices)
                        END
                    )
                )
            ), '[]'::jsonb)
            FROM project_questions pq
            LEFT JOIN project_answers pa ON pa.question_id = pq.id AND pa.project_id = p.id
        ),
        'documents', (
            SELECT coalesce(jsonb_agg(
                jsonb_build_object(
                    'id', pd.id::text,
                    'project_id', pd.project_id::text,
                    'question_id', pd.question_id::text,
                    'name', pd.name,
                    'url', pd.url,
                    'section', pd.section,
                    'sub_section', pd.sub_section,
                    'mime_type', pd.mime_type,
                    'size', pd.size,
                    'created_at', pd.created_at,
                    'updated_at', pd.updated_at
                )
            ), '[]'::jsonb)
            FROM project_documents pd
            WHERE pd.project_id = p.id
        ),
        'team_members', (
            SELECT coalesce(jsonb_agg(
                jsonb_build_object(
                    'id', tm.id::text,
                    'company_id', tm.company_id::text,
                    'first_name', tm.first_name,
                    'last_name', tm.last_name,
                    'title', tm.title,
                    'linkedin_url', tm.linkedin_url,
                    'is_account_owner', tm.is_account_owner,
                    'personal_website', tm.personal_website,
                    'commitment_type', tm.commitment_type,
                    'introduction', tm.introduction,
                    'industry_experience', tm.industry_experience,
                    'detailed_biography', tm.detailed_biography,
                    'previous_work', tm.previous_work,
                    'resume_external_url', tm.resume_external_url,
                    'resume_internal_url', tm.resume_internal_url,
                    'founders_agreement_external_url', tm.founders_agreement_external_url,
                    'founders_agreement_internal_url', tm.founders_agreement_internal_url,
                    'created_at', tm.created_at,
                    'updated_at', tm.updated_at,
                    'social_links', tm.social_links
                )
            ), '[]'::jsonb)
            FROM team_members tm
            WHERE tm.company_id = p.company_id
        )
    ), -- data column
    1, -- version_number
    p.title, -- title
    NULL, -- parent_snapshot_id
    extract(epoch from now())::bigint -- created_at timestamp in epoch seconds
FROM
    projects p
WHERE
    NOT EXISTS (
        SELECT 1
        FROM project_snapshots ps
        WHERE ps.project_id = p.id
    );
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_snapshots;
-- +goose StatementEnd
