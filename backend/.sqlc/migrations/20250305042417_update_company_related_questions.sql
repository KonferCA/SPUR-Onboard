-- +goose Up
-- +goose StatementBegin
UPDATE project_questions
SET question = 'What''s the name of your company or project?'
WHERE question_key = 'company_name';

UPDATE project_questions
SET question = 'When was your company or project founded?'
WHERE question_key = 'company_founding_date';

UPDATE project_questions
SET question = 'What technical industry is your company or project focused on?'
WHERE question_key = 'company_industries';

UPDATE project_questions
SET question = 'What stage is your company or project at?'
WHERE question_key = 'company_stage';

UPDATE project_questions
SET question = 'What investment stage is your company or project at?'
WHERE question_key = 'investment_stage';

UPDATE project_questions
SET question = 'Include a link to a 5-minute video of you pitching yourself, your company, or your project'
WHERE question_key = 'pitch_video_link';

UPDATE project_questions
SET question = 'What is the company''s or project''s mission?'
WHERE question_key = 'company_mission';

UPDATE project_questions
SET question = 'What is the company''s or project''s business plan?'
WHERE question_key = 'business_plan_text';

UPDATE project_questions
SET question = 'What is the company''s or project''s business plan?'
WHERE question_key = 'business_plan_file';

UPDATE project_questions
SET question = 'Is the company or project properly registered and in good legal standing?'
WHERE question_key = 'legal_standing';

UPDATE project_questions
SET question = 'Does the company or project comply with industry-specific regulations?'
WHERE question_key = 'regulatory_compliance';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
UPDATE project_questions
SET question = 'What is the name of your company?'
WHERE question_key = 'company_name';

UPDATE project_questions
SET question = 'When was your company founded?'
WHERE question_key = 'company_founding_date';

UPDATE project_questions
SET question = 'What technical industry is your company focused on?'
WHERE question_key = 'company_industries';

UPDATE project_questions
SET question = 'What stage is your company at?'
WHERE question_key = 'company_stage';

UPDATE project_questions
SET question = 'What investment stage is your company at?'
WHERE question_key = 'investment_stage';

UPDATE project_questions
SET question = 'Include a link to a 5-minute video of you or your company pitching itself.'
WHERE question_key = 'pitch_video_link';

UPDATE project_questions
SET question = 'What is the company''s mission?'
WHERE question_key = 'company_mission';

UPDATE project_questions
SET question = 'What is the company''s business plan?'
WHERE question_key = 'business_plan_text';

UPDATE project_questions
SET question = 'What is the company''s business plan?'
WHERE question_key = 'business_plan_file';

UPDATE project_questions
SET question = 'Is the company properly registered and in good legal standing?'
WHERE question_key = 'legal_standing';

UPDATE project_questions
SET question = 'Does the company comply with industry-specific regulations?'
WHERE question_key = 'regulatory_compliance';
-- +goose StatementEnd
