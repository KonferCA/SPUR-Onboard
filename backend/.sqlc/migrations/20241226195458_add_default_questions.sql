-- +goose Up
-- +goose StatementBegin

-- seed database with initial default questions

-- helper function to insert questions
CREATE OR REPLACE FUNCTION insert_question_with_input_types(
   p_question varchar,
   p_section varchar,
   p_sub_section varchar,
   p_section_order int,
   p_sub_section_order int,
   p_question_order int,
   p_required boolean,
   p_input_types text,
   p_options varchar[] DEFAULT NULL,
   p_validations jsonb DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
   v_question_id uuid;
   v_input_type input_type_enum;
   v_validation_json jsonb;
   v_input_validations jsonb;
BEGIN
   INSERT INTO project_questions (
       question, section, sub_section, section_order, sub_section_order, 
       question_order, required
   ) VALUES (
       p_question, p_section, p_sub_section, p_section_order, p_sub_section_order,
       p_question_order, p_required
   ) RETURNING id INTO v_question_id;

   FOR v_input_type IN 
       SELECT unnest(string_to_array(p_input_types, '|')::input_type_enum[])
   LOOP
       IF p_validations IS NOT NULL AND p_validations ? v_input_type::text THEN
           v_input_validations := p_validations->v_input_type::text;
           v_validation_json := jsonb_build_object('required', p_required);
           v_validation_json := v_validation_json || v_input_validations;
       ELSE
           CASE v_input_type
               WHEN 'url' THEN
                   v_validation_json := jsonb_build_object(
                       'urlPattern', '^https?://.*',
                       'required', p_required
                   );
               WHEN 'file' THEN
                   v_validation_json := jsonb_build_object(
                       'fileTypes', '["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]',
                       'maxFileSize', 10485760,
                       'required', p_required
                   );
               WHEN 'textarea' THEN
                   v_validation_json := jsonb_build_object(
                       'minLength', 1,
                       'maxLength', 5000,
                       'required', p_required
                   );
               WHEN 'textinput' THEN
                   v_validation_json := jsonb_build_object(
                       'minLength', 1,
                       'maxLength', 1000,
                       'required', p_required
                   );
               WHEN 'select' THEN
                   v_validation_json := jsonb_build_object(
                       'options', to_jsonb(p_options),
                       'required', p_required
                   );
               WHEN 'checkbox' THEN
                   v_validation_json := jsonb_build_object(
                       'options', to_jsonb(p_options),
                       'required', p_required,
                       'multiple', true
                   );
               WHEN 'radio' THEN
                   v_validation_json := jsonb_build_object(
                       'options', to_jsonb(p_options),
                       'required', p_required,
                       'multiple', false
                   );
               WHEN 'team' THEN
                   v_validation_json := jsonb_build_object(
                       'required', p_required,
                       'minMembers', 1,
                       'maxMembers', 10
                   );
               ELSE
                   v_validation_json := jsonb_build_object('required', p_required);
           END CASE;
       END IF;

       INSERT INTO question_input_types (
           question_id, input_type, options, validations
       ) VALUES (
           v_question_id, v_input_type, p_options, v_validation_json
       );
   END LOOP;
   RETURN v_question_id;
END;
$$ LANGUAGE plpgsql;

-- SECTION: The Basics
-- SUB-SECTION: Company Pitch
SELECT insert_question_with_input_types(
    'Include a link to a 5-minute video of you or your company pitching itself.',
    'The Basics',
    'Company Pitch',
    0, 0, 0,
    false,
    'url'
);

SELECT insert_question_with_input_types(
    'Please upload a pitch deck. (Upload file or URL)',
    'The Basics',
    'Company Pitch',
    0, 0, 1,
    false,
    'file|url'
);

-- SUB-SECTION: Business Overview
SELECT insert_question_with_input_types(
    'What is the core product or service, and what problem does it solve?',
    'The Basics', 'Business Overview',
    0, 1, 0,
    true, 'textarea'
);

SELECT insert_question_with_input_types(
    'What is the unique value proposition?',
    'The Basics', 'Business Overview',
    0, 1, 1,
    true, 'textarea'
);

SELECT insert_question_with_input_types(
    'Who are the main competitors, and how is the business differentiated from them?',
    'The Basics', 'Business Overview',
    0, 1, 2,
    true, 'textarea'
);

SELECT insert_question_with_input_types(
    'What is the company''s mission?',
    'The Basics', 'Business Overview',
    0, 1, 3,
    true, 'textinput'
);

SELECT insert_question_with_input_types(
    'What is the company''s business plan?',
    'The Basics', 'Business Overview',
    0, 1, 4,
    true, 'textinput|file'
);

-- SUB-SECTION: Market Analysis & Research
SELECT insert_question_with_input_types(
    'Who are the target customers, and what are their needs?',
    'The Basics', 'Market Analysis & Research',
    0, 2, 0, 
    true, 'textarea'
);

SELECT insert_question_with_input_types(
    'What is the size and growth rate of the target market?',
    'The Basics', 'Market Analysis & Research',
    0, 2, 1,
    true, 'textarea'
);

SELECT insert_question_with_input_types(
    'What is the total addressable market (TAM), and how much can the startup realistically capture?',
    'The Basics', 'Market Analysis & Research',
    0, 2, 2,
    true, 'textarea'
);

SELECT insert_question_with_input_types(
    'What are the main market trends and drivers?',
    'The Basics', 'Market Analysis & Research',
    0, 2, 3,
    false, 'textarea'
);

SELECT insert_question_with_input_types(
    'Are there any significant barriers to entry or competitive advantages?',
    'The Basics', 'Market Analysis & Research',
    0, 2, 4,
    false, 'textarea'
);

SELECT insert_question_with_input_types(
    'Do you have any market research-related documents you''d like to inlcude? (Upload file or URL)',
    'The Basics', 'Market Analysis & Research',
    0, 2, 5,
    false, 'file|url'
);

SELECT insert_question_with_input_types(
    'Do you have any customer data-related documents you''d like to include? (Upload file or URL)',
    'The Basics', 'Market Analysis & Research',
    0, 2, 6,
    false, 'file|url'
);

-- SUB-SECTION: Product or Service
SELECT insert_question_with_input_types(
   'What stage of development is the product in (idea, prototype, MVP, production)?',
   'The Basics', 'Product or Service',
   0, 3, 0,
   true, 'select',
   ARRAY['Idea', 'Prototype', 'MVP', 'Production']
);

SELECT insert_question_with_input_types(
   'How scalable is the product/service?',
   'The Basics', 'Product or Service',
   0, 3, 1,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'What feedback has been received from early customers or beta users?',
   'The Basics', 'Product or Service',
   0, 3, 2,
   false, 'textarea'
);

SELECT insert_question_with_input_types(
   'Are any intellectual property (IP) protections, such as patents or trademarks in place?',
   'The Basics', 'Product or Service',
   0, 3, 3,
   false, 'textarea'
);

-- SUB-SECTION: Traction
SELECT insert_question_with_input_types(
   'How many customers or users does the startup currently have?',
   'The Basics', 'Traction',
   0, 4, 0,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'Are there partnerships in place?',
   'The Basics', 'Traction',
   0, 4, 1,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'Has the startup received media coverage, awards, or endorsements?',
   'The Basics', 'Traction',
   0, 4, 2,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'What milestones has the startup achieved so far?',
   'The Basics', 'Traction',
   0, 4, 3,
   true, 'textarea'
);

-- SUB-SECTION: Risks and Challenges
SELECT insert_question_with_input_types(
   'What are the major risks (market, operational, competitive, regulatory)?',
   'The Basics', 'Risks and Challenges',
   0, 5, 0,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'How does the startup plan to mitigate these risks?',
   'The Basics', 'Risks and Challenges',
   0, 5, 1,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'Are there any key dependencies (e.g., suppliers, technology)?',
   'The Basics', 'Risks and Challenges',
   0, 5, 2,
   true, 'textinput'
);

-- SUB-SECTION: Exit Strategy
SELECT insert_question_with_input_types(
   'What is the long-term vision for the business?',
   'The Basics', 'Exit Strategy',
   0, 6, 0,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'Does the startup have a defined exit strategy (e.g., acquisition, IPO)?',
   'The Basics', 'Exit Strategy',
   0, 6, 1,
   true, 'textarea'
);

SELECT insert_question_with_input_types(
   'Are there potential acquirers or exit opportunities in the market?',
   'The Basics', 'Exit Strategy',
   0, 6, 2,
   false, 'textinput'
);

SELECT insert_question_with_input_types(
   'What is the projected return on investment (ROI) for investors?',
   'The Basics', 'Exit Strategy',
   0, 6, 3,
   false, 'textarea'
);

-- SUB-SECTION: Alignment and Impact
SELECT insert_question_with_input_types(
    'Does the startup align with SPUR''s values and mission?',
    'The Basics',
    'Alignment and Impact',
    0, 7, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How does the startup align with SPUR''s strategic priorities and goals?',
    'The Basics', 
    'Alignment and Impact',
    0, 7, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are there potential synergies with other startups or partners from SPUR?',
    'The Basics',
    'Alignment and Impact', 
    0, 7, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Can SPUR provide unique value beyond funding (e.g., mentorship, networking)?',
    'The Basics',
    'Alignment and Impact',
    0, 7, 3, 
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are you open to mentorship, guidance or collaboration from SPUR or its network?',
    'The Basics',
    'Alignment and Impact',
    0, 7, 4,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is the potential for a positive impact?',
    'The Basics',
    'Alignment and Impact',
    0, 7, 5,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How does the startup contribute to local or global communities?',
    'The Basics',
    'Alignment and Impact',
    0, 7, 6,
    true,
    'textarea'
);

-- SUB-SECTION: Legal and Compliance
SELECT insert_question_with_input_types(
    'Is the company properly registered and in good legal standing?',
    'The Basics',
    'Legal and Compliance',
    0, 8, 0,
    true, 
    'textinput'
);

SELECT insert_question_with_input_types(
    'Are the ownership and equity structures clear and documented?',
    'The Basics',
    'Legal and Compliance',
    0, 8, 1,
    true,
    'textinput'
);

SELECT insert_question_with_input_types(
    'Are there any outstanding legal disputes or liabilities?', 
    'The Basics',
    'Legal and Compliance',
    0, 8, 2,
    true,
    'textinput'
);

SELECT insert_question_with_input_types(
    'Does the company comply with industry-specific regulations?',
    'The Basics', 
    'Legal and Compliance',
    0, 8, 3,
    true,
    'textinput'
);

SELECT insert_question_with_input_types(
    'Do you have any contracts, agreements, or letters of intent you''d like to include? (Upload file or URL)',
    'The Basics',
    'Legal and Compliance',
    0, 8, 4,
    false,
    'textinput|file'
);

-- SECTION: The Team
-- SUB-SECTION: Team Members
SELECT insert_question_with_input_types(
   '',
   'The Team',
   'Team Members',
   1, 0, 0,
   true,
   'team'
);

-- SUB-SECTION: Team Background
SELECT insert_question_with_input_types(
   'Who are the founders and key team members, and what are their backgrounds?',
   'The Team',
   'Team Background',
   1, 1, 0,
   true,
   'textarea'
);

SELECT insert_question_with_input_types(
   'Do they have relevant experience in the industry?',
   'The Team',
   'Team Background',
   1, 1, 1,
   true,
   'textarea'
);

SELECT insert_question_with_input_types(
   'How committed are the founders (e.g., full-time, personal investment)?',
   'The Team',
   'Team Background',
   1, 1, 2,
   true,
   'textarea'
);

SELECT insert_question_with_input_types(
   'Does the team have a balanced skill set (technical, operational, marketing, finance)?',
   'The Team',
   'Team Background',
   1, 1, 3,
   true,
   'textarea'
);

-- SUB-SECTION: Personal Background
SELECT insert_question_with_input_types(
    'What is your professional and educational background?',
    'The Team',
    'Personal Background', 
    1, 2, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What relevant experience do you have in this industry or market?',
    'The Team',
    'Personal Background',
    1, 2, 1, 
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Have you successfully launched or managed any startups or businesses before? If so, what were the outcomes?',
    'The Team',
    'Personal Background',
    1, 2, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What lessons did you learn from your previous ventures, both successful and unsuccessful?',
    'The Team',
    'Personal Background',
    1, 2, 3,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How well do you understand the technical and operational aspects of your business?',
    'The Team',
    'Personal Background',
    1, 2, 4,
    true,
    'textarea'
);

-- SUB-SECTION: Vision and Motivation
SELECT insert_question_with_input_types(
    'What inspired you to start this business?',
    'The Team',
    'Vision and Motivation',
    1, 3, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is the long-term vision for the company, and how do you plan to achieve it?',
    'The Team',
    'Vision and Motivation',
    1, 3, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What motivates you to continue pursuing this business, especially during challenging times?',
    'The Team',
    'Vision and Motivation', 
    1, 3, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you measure success for yourself and your business?',
    'The Team',
    'Vision and Motivation',
    1, 3, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Leadership
SELECT insert_question_with_input_types(
    'What is your leadership style?',
    'The Team',
    'Leadership',
    1, 4, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you manage and motivate your team?',
    'The Team',
    'Leadership',
    1, 4, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you handle conflict within the team and/or with external stakeholders?',
    'The Team',
    'Leadership',
    1, 4, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are you comfortable delegating responsibilities, or do you tend to take on too much yourself?',
    'The Team',
    'Leadership',
    1, 4, 3,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What processes do you have in place to attract, retain, and develop talent?',
    'The Team',
    'Leadership',
    1, 4, 4,
    true,
    'textarea'
);

-- SUB-SECTION: Personal Commitment
SELECT insert_question_with_input_types(
    'How committed are you to this venture?',
    'The Team',
    'Personal Commitment',
    1, 5, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How much personal capital have you invested in the business?',
    'The Team',
    'Personal Commitment', 
    1, 5, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are there any other obligations or ventures that could divide your focus?',
    'The Team',
    'Personal Commitment',
    1, 5, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How long do you see yourself staying actively involved in the business?',
    'The Team',
    'Personal Commitment',
    1, 5, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Knowledge and Preparedness
SELECT insert_question_with_input_types(
    'How well do you understand your target market, customer needs, and competitive landscape?',
    'The Team',
    'Knowledge and Preparedness',
    1, 6, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What research or validation have you done to confirm demand for your product or service?',
    'The Team',
    'Knowledge and Preparedness',
    1, 6, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Do you have a roadmap for the next 12 months, 3 years, and 5 years?',
    'The Team',
    'Knowledge and Preparedness',
    1, 6, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What contingencies have you planned for potential risks or challenges?',
    'The Team',
    'Knowledge and Preparedness',
    1, 6, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Problem-Solving and Resillience
SELECT insert_question_with_input_types(
    'Can you share an example of a major challenge you''ve faced and how you resolved it',
    'The Team',
    'Problem-Solving and Resillience',
    1, 7, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you make decisions under pressure or with incomplete information?',
    'The Team', 
    'Problem-Solving and Resillience',
    1, 7, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What are the biggest risks to your business, and how do you plan to mitigate them',
    'The Team',
    'Problem-Solving and Resillience', 
    1, 7, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you handle setbacks or failures?',
    'The Team',
    'Problem-Solving and Resillience',
    1, 7, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Relationships and Networking
SELECT insert_question_with_input_types(
    'What key partnerships, relationships, or networks have you built to support your business?',
    'The Team',
    'Relationships and Networking',
    1, 8, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you approach building relationships with customers, suppliers, and investors?',
    'The Team',
    'Relationships and Networking',
    1, 8, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are you active in relevant industry communities or events?',
    'The Team',
    'Relationships and Networking', 
    1, 8, 2,
    true,
    'textarea'
);

-- SUB-SECTION: Personality and Soft Skills
SELECT insert_question_with_input_types(
    'How would your team describe your management style and personality?',
    'The Team',
    'Personality and Soft Skills',
    1, 9, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you handle feedback or criticism?',
    'The Team',
    'Personality and Soft Skills',
    1, 9, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What are your leadership strengths, and what areas are you actively working to improve?',
    'The Team',
    'Personality and Soft Skills',
    1, 9, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you maintain your focus and energy while balancing the demands of entrepreneurship?',
    'The Team',
    'Personality and Soft Skills',
    1, 9, 3,
    true,
    'textarea'
);

-- SECTION: The History nothing in notion yet
--

-- SECTION: The Financials
-- SUB-SECTION: Financial and Strategic Understanding
SELECT insert_question_with_input_types(
    'Do you clearly understand your financial metrics (e.g., revenue, expenses, cash flow)?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 0, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is your business scaling strategy, and how will you fund growth?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 0, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'How do you prioritize spending and allocate resources?',
    'The Financials', 
    'Financial and Strategic Understanding',
    2, 0, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is your exit strategy, and how does it align with investor expectations?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 0, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Financial Overview
SELECT insert_question_with_input_types(
    'What is the current revenue and growth rate?',
    'The Financials',
    'Financial Overview',
    2, 1, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What are the gross and net profit margins?',
    'The Financials',
    'Financial Overview',
    2, 1, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is the customer acquisition cost (CAC) and lifetime value (LTV)?',
    'The Financials',
    'Financial Overview',
    2, 1, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are the financial projections realistic and based on credible assumptions?',
    'The Financials',
    'Financial Overview',
    2, 1, 3,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is the current burn rate, and how much runway is left?',
    'The Financials',
    'Financial Overview',
    2, 1, 4,
    true,
    'textarea'
);

-- SUB-SECTION: Financial Needs & Usage
SELECT insert_question_with_input_types(
    'How much funding is the startup seeking, and what will it be used for?',
    'The Financials',
    'Financial Needs & Usage',
    2, 2, 0,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What milestones will the funding help achieve?',
    'The Financials',
    'Financial Needs & Usage',
    2, 2, 1,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'Are there other sources of funding (e.g., grants, loans, existing investors)?',
    'The Financials',
    'Financial Needs & Usage',
    2, 2, 2,
    true,
    'textarea'
);

SELECT insert_question_with_input_types(
    'What is the proposed valuation, and is it justified?',
    'The Financials',
    'Financial Needs & Usage',
    2, 2, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Documents
SELECT insert_question_with_input_types(
    'Cap table',
    'The Financials',
    'Documents',
    2, 3, 0,
    true,
    'file'
);

SELECT insert_question_with_input_types(
    'Income statement',
    'The Financials',
    'Documents', 
    2, 3, 1,
    true,
    'file'
);

SELECT insert_question_with_input_types(
    'Balance sheet',
    'The Financials',
    'Documents',
    2, 3, 2,
    true,
    'file'
);

SELECT insert_question_with_input_types(
    'Cash flow',
    'The Financials',
    'Documents',
    2, 3, 3,
    true,
    'file'
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_questions; 
DROP FUNCTION IF EXISTS insert_question_with_input_types CASCADE; -- removes all versions of the function
-- +goose StatementEnd
