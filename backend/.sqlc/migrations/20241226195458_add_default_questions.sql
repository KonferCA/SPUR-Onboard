-- +goose Up
-- +goose StatementBegin

-- SECTION: The Basics

-- SUB-SECTION: Introduction
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    disabled
) VALUES (
    'What is the name of your company?',
    'The Basics',
    'Introduction',
    0, 0, 0,
    true,
    'textinput',
    true
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    disabled
) VALUES (
    'When was your company founded?',
    'The Basics',
    'Introduction',
    0, 0, 1,
    true,
    'date',
    true
);

WITH company_stage_question AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        options
    ) VALUES (
        'What stage is your company at?',
        'The Basics',
        'Introduction',
        0, 0, 2,
        true,
        'multiselect',
        ARRAY['Ideation','MVP','Investment','Product-market fit','Go-to-market','Growth','Maturity']
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    options,
    condition_type,
    condition_value,
    dependent_question_id
) VALUES (
    'What investment stage is your company at?',
    'The Basics',
    'Introduction',
    0, 0, 3,
    true,
    'select',
    ARRAY['Pre-Seed','Seed','Series A/B', 'Series C/D', 'Series E/F'],
    'contains',
    'Investment',
    (SELECT id FROM company_stage_question)
);

-- SUB-SECTION: Company Pitch
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    validations
) VALUES (
    'Include a link to a 5-minute video of you or your company pitching itself.',
    'The Basics',
    'Company Pitch',
    0, 1, 0,
    false,
    'textinput',
    ARRAY['url']
);

WITH pitch_deck_group AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
    ) VALUES (
        'Please upload a pitch deck.',
        'The Basics',
        'Company Pitch',
        0, 1, 1,
        false,
        'textinput',
        ARRAY['url'],
       'Provide a link to pitch deck',
        'You can either provide a URL to your pitch deck or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
) VALUES (
    'Please upload a pitch deck.',
    'The Basics',
    'Company Pitch',
    0, 1, 2,
    false,
    'file',
    (SELECT id FROM pitch_deck_group)
);

-- SUB-SECTION: Business Overview
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the core product or service, and what problem does it solve?',
    'The Basics',
    'Business Overview',
    0, 2, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the unique value proposition?',
    'The Basics',
    'Business Overview',
    0, 2, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the company''s mission?',
    'The Basics',
    'Business Overview',
    0, 2, 2,
    true,
    'textinput'
);

WITH company_bussiness_plan AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations
        ) VALUES (
        'What is the company''s business plan?',
        'The Basics',
        'Business Overview',
        0, 2, 3,
        false,
        'textinput',
        ARRAY['url']
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
    ) VALUES (
    'What is the company''s business plan?',
    'The Basics',
    'Business Overview',
    0, 2, 4,
    false,
    'file',
    (SELECT id FROM company_bussiness_plan)
);

-- SUB-SECTION: Market Analysis & Research
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Who are the target customers, and what are their needs?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Who are the main competitors, and how is the business differentiated from them',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the size and growth rate of the target market?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the total addressable market (TAM), and how much can the startup realistically capture?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 3,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What are the main market trends and drivers?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 4,
    false,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there any significant barriers to entry or competitive advantages?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 5,
    false,
    'textarea'
);

WITH market_related_docs AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
        ) VALUES (
        'Do you have any market research-related documents you''d like to inlcude?',
        'The Basics',
        'Market Analysis & Research',
        0, 3, 6,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
    ) VALUES (
    'Do you have any market research-related documents you''d like to inlcude?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 7,
    false,
    'file',
    (SELECT id FROM market_related_docs)
);

WITH docs AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
    ) VALUES (
        'Do you have any customer data-related documents you''d like to include?',
        'The Basics',
        'Market Analysis & Research',
        0, 3, 8,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
) VALUES (
    'Do you have any customer data-related documents you''d like to include?',
    'The Basics',
    'Market Analysis & Research',
    0, 3, 9,
    false,
    'file',
    (SELECT id FROM docs)
);

-- SUB-SECTION: Product or Service
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    options
) VALUES (
    'What stage of development is the product in (idea, prototype, MVP, production)?',
    'The Basics',
    'Product or Service',
    0, 4, 0,
    true,
    'select',
    ARRAY['Idea', 'Prototype', 'MVP', 'Production']
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How scalable is the product/service?',
    'The Basics',
    'Product or Service',
    0, 4, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What feedback has been received from early customers or beta users?',
    'The Basics',
    'Product or Service',
    0, 4, 2,
    false,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are any intellectual property (IP) protections, such as patents or trademarks in place?',
    'The Basics',
    'Product or Service',
    0, 4, 3,
    false,
    'textarea'
);

WITH g AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations
    ) VALUES (
        'Are there any IP-related files you would like to upload, such as patents or trademarks?',
        'The Basics',
        'Product or Service',
        0, 4, 4,
        false,
        'textarea',
        ARRAY['url']
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
) VALUES (
    'Are there any IP-related files you would like to upload, such as patents or trademarks?',
    'The Basics',
    'Product or Service',
    0, 4, 5,
    false,
    'file',
    (SELECT id FROM g)
);

-- SUB-SECTION: Traction
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How many customers or users does the startup currently have?',
    'The Basics',
    'Traction',
    0, 5, 0,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there partnerships in place?',
    'The Basics',
    'Traction',
    0, 5, 1,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Has the startup received media coverage, awards, or endorsements?',
    'The Basics',
    'Traction',
    0, 5, 2,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What milestones has the startup achieved so far?',
    'The Basics',
    'Traction',
    0, 5, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Risks and Challenges
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What are the major risks (market, operational, competitive, regulatory)?',
    'The Basics',
    'Risks and Challenges',
    0, 6, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How does the startup plan to mitigate these risks?',
    'The Basics',
    'Risks and Challenges',
    0, 6, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there any key dependencies (e.g., suppliers, technology)?',
    'The Basics',
    'Risks and Challenges',
    0, 6, 2,
    true,
    'textinput'
);

-- SUB-SECTION: Exit Strategy
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the long-term vision for the business and how do you plan to achieve it?',
    'The Basics',
    'Exit Strategy',
    0, 7, 0,
    true,
    'textarea'
);

WITH exit_strategy AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        options
        ) VALUES (
        'Does the startup have a defined exit strategy?',
        'The Basics',
        'Exit Strategy',
        0, 7, 1,
        true,
        'select',
        ARRAY['Merger and/or acquisition','Initial public offering (IPO)','Management buyout','Other']
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    condition_type,
    condition_value,
    dependent_question_id
    ) VALUES (
    'Please elaborate on this exit strategy',
    'The Basics',
    'Exit Strategy',
    0, 7, 2,
    true,
    'textinput',
    'not_empty',
    NULL,
    (SELECT id FROM exit_strategy)
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there potential acquirers or exit opportunities in the market?',
    'The Basics',
    'Exit Strategy',
    0, 7, 3,
    false,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the projected return on investment (ROI) for investors?',
    'The Basics',
    'Exit Strategy',
    0, 7, 4,
    false,
    'textarea'
);

-- SUB-SECTION: Alignment and Impact
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Does the startup align with SPUR''s mission, goals, strategic priorities, and values?',
    'The Basics',
    'Alignment and Impact',
    0, 8, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
    ) VALUES (
    'Are there potential synergies with other startups or partners from SPUR?',
    'The Basics',
    'Alignment and Impact',
    0, 8, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Can SPUR provide unique value beyond funding (e.g., mentorship, networking)?',
    'The Basics',
    'Alignment and Impact',
    0, 8, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are you open to mentorship, guidance or collaboration from SPUR or its network?',
    'The Basics',
    'Alignment and Impact',
    0, 8, 3,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the potential for a positive impact?',
    'The Basics',
    'Alignment and Impact',
    0, 8, 4,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How does the startup contribute to local or global communities?',
    'The Basics',
    'Alignment and Impact',
    0, 8, 5,
    true,
    'textarea'
);

-- SUB-SECTION: Legal and Compliance
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Is the company properly registered and in good legal standing?',
    'The Basics',
    'Legal and Compliance',
    0, 9, 0,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are the ownership and equity structures clear and documented?',
    'The Basics',
    'Legal and Compliance',
    0, 9, 1,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there any outstanding legal disputes, legal issues, compliance issues, or liabilities?',
    'The Basics',
    'Legal and Compliance',
    0, 9, 2,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Does the company comply with industry-specific regulations?',
    'The Basics',
    'Legal and Compliance',
    0, 9, 3,
    true,
    'textinput'
);

WITH docs AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
    ) VALUES (
        'Do you have any contracts, agreements, or letters of intent you''d like to include?',
        'The Basics',
        'Legal and Compliance',
        0, 9, 4,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
) VALUES (
    'Do you have any contracts, agreements, or letters of intent you''d like to include?',
    'The Basics',
    'Legal and Compliance',
    0, 9, 5,
    false,
    'file',
    (SELECT id FROM docs)
);

-- SECTION: The Team
-- SUB-SECTION: Team Members
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    '',
    'The Team',
    'Team Members',
    1, 0, 0,
    true,
    'team'
);

-- SUB-SECTION: Personal Background
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is your professional and educational background?',
    'The Team',
    'Personal Background',
    1, 1, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What relevant experience do you have in this industry or market?',
    'The Team',
    'Personal Background',
    1, 1, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Have you successfully launched or managed any startups or businesses before? If so, what were the outcomes?',
    'The Team',
    'Personal Background',
    1, 1, 2,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What lessons did you learn from your previous ventures, both successful and unsuccessful?',
    'The Team',
    'Personal Background',
    1, 1, 3,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How well do you understand the technical and operational aspects of your business?',
    'The Team',
    'Personal Background',
    1, 1, 4,
    true,
    'textarea'
);

-- SUB-SECTION: Vision & Motiviation
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What inspired you to start this business?',
    'The Team',
    'Vision & Motivation',
    1, 2, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What motivates you to continue pursuing this business, especially during challenging times?',
    'The Team',
    'Vision & Motivation',
    1, 2, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you measure success for yourself and your business?',
    'The Team',
    'Vision & Motivation',
    1, 2, 2,
    true,
    'textarea'
);

-- SUB-SECTION: Leadership
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is your leadership style?',
    'The Team',
    'Leadership',
    1, 3, 0,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Does the team have a balanced skill set (technical, operational, marketing, finance)?',
    'The Team',
    'Leadership',
    1, 3, 1,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you manage and motivate your team?',
    'The Team',
    'Leadership',
    1, 3, 2,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you handle conflict within the team and/or with external stakeholders?',
    'The Team',
    'Leadership',
    1, 3, 3,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are you comfortable delegating responsibilities, or do you tend to take on too much yourself?',
    'The Team',
    'Leadership',
    1, 3, 4,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What processes do you have in place to attract, retain, and develop talent?',
    'The Team',
    'Leadership',
    1, 3, 5,
    true,
    'textinput'
);

-- SUB-SECTION: Personal Commitment
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How committed are you to this venture (full-time, part-time, etc)?',
    'The Team',
    'Personal Commitment',
    1, 4, 0,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How much personal capital have you invested in the business?',
    'The Team',
    'Personal Commitment',
    1, 4, 1,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there any other obligations or ventures that could divide your focus?',
    'The Team',
    'Personal Commitment',
    1, 4, 2,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How long do you see yourself staying actively involved in the business?',
    'The Team',
    'Personal Commitment',
    1, 4, 1,
    true,
    'textarea'
);

-- SUB-SECTION: Knowledge and Preparedness
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How well do you understand your target market, customer needs, and competitive landscape?',
    'The Team',
    'Knowledge and Preparedness',
    1, 5, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What research or validation have you done to confirm demand for your product or service?',
    'The Team',
    'Knowledge and Preparedness',
    1, 5, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Do you have a roadmap for the next 12 months, 3 years, and 5 years?',
    'The Team',
    'Knowledge and Preparedness',
    1, 5, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What contingencies have you planned for potential risks or challenges?',
    'The Team',
    'Knowledge and Preparedness',
    1, 5, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Problem-Solving and Resillience
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Can you share an example of a major challenge you''ve faced and how you resolved it',
    'The Team',
    'Problem-Solving and Resillience',
    1, 6, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you make decisions under pressure or with incomplete information?',
    'The Team',
    'Problem-Solving and Resillience',
    1, 6, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What are the biggest risks to your business, and how do you plan to mitigate them',
    'The Team',
    'Problem-Solving and Resillience',
    1, 6, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you handle setbacks or failures?',
    'The Team',
    'Problem-Solving and Resillience',
    1, 6, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Relationships and Networking
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are you active in relevant industry communities or events?',
    'The Team',
    'Relationships and Networking',
    1, 7, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What key partnerships, relationships, or networks have you built to support your business?',
    'The Team',
    'Relationships and Networking',
    1, 7, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you approach building relationships with customers, suppliers, and investors?',
    'The Team',
    'Relationships and Networking',
    1, 7, 2,
    true,
    'textarea'
);

-- SUB-SECTION: Personality and Soft Skills
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How would your team describe your management style and personality?',
    'The Team',
    'Personality and Soft Skills',
    1, 8, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you handle feedback or criticism?',
    'The Team',
    'Personality and Soft Skills',
    1, 8, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What are your leadership strengths, and what areas are you actively working to improve?',
    'The Team',
    'Personality and Soft Skills',
    1, 8, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you maintain your focus and energy while balancing the demands of entrepreneurship?',
    'The Team',
    'Personality and Soft Skills',
    1, 8, 3,
    true,
    'textarea'
);

-- SECTION: The History nothing in notion yet
--

-- SECTION: The Financials
-- SUB-SECTION: Financial Overview
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the current revenue and growth rate?',
    'The Financials',
    'Financial Overview',
    2, 0, 0,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What are the gross and net profit margins?',
    'The Financials',
    'Financial Overview',
    2, 0, 1,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the customer acquisition cost (CAC) and lifetime value (LTV)?',
    'The Financials',
    'Financial Overview',
    2, 0, 2,
    true,
    'textinput'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are the financial projections realistic and based on credible assumptions?',
    'The Financials',
    'Financial Overview',
    2, 0, 3,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the current burn rate, and how much runway is left?',
    'The Financials',
    'Financial Overview',
    2, 0, 4,
    true,
    'textarea'
);

WITH doc AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
        ) VALUES (
        'Do you have a capitalization table you''d like to include?',
        'The Financials',
        'Financial Overview',
        2, 0, 5,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
    ) VALUES (
    'Do you have a capitalization table you''d like to include?',
    'The Financials',
    'Financial Overview',
    2, 0, 6,
    false,
    'file',
    (SELECT id FROM doc)
);

WITH doc AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
        ) VALUES (
        'Do you have any cash flow-related documents you''d like to include?',
        'The Financials',
        'Financial Overview',
        2, 0, 7,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
    ) VALUES (
    'Do you have any cash flow-related documents you''d like to include?',
    'The Financials',
    'Financial Overview',
    2, 0, 8,
    false,
    'file',
    (SELECT id FROM doc)
);

WITH doc AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
        ) VALUES (
        'Do you have any income statement-related documents you''d like to include?',
        'The Financials',
        'Financial Overview',
        2, 0, 9,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
    ) VALUES (
    'Do you have any income statement-related documents you’d like to include?',
    'The Financials',
    'Financial Overview',
    2, 0, 10,
    false,
    'file',
    (SELECT id FROM doc)
);

WITH doc AS (
    INSERT INTO project_questions (
        question,
        section,
        sub_section,
        section_order,
        sub_section_order,
        question_order,
        required,
        input_type,
        validations,
        placeholder,
        description
        ) VALUES (
        'Do you have any balance sheet-related documents you’d like to include?',
        'The Financials',
        'Financial Overview',
        2, 0, 11,
        false,
        'textinput',
        ARRAY['url'],
        'Provide a link to documents',
        'You can either provide a URL or upload it directly'
    ) RETURNING id
)
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type,
    question_group_id
    ) VALUES (
    'Do you have any balance sheet-related documents you’d like to include?',
    'The Financials',
    'Financial Overview',
    2, 0, 12,
    false,
    'file',
    (SELECT id FROM doc)
);

-- SUB-SECTION: Financial Needs & Usage
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How much funding is the startup seeking, and what will it be used for?',
    'The Financials',
    'Financial Needs & Usage',
    2, 1, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What milestones will the funding help achieve?',
    'The Financials',
    'Financial Needs & Usage',
    2, 1, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Are there other sources of funding (e.g., grants, loans, existing investors)?',
    'The Financials',
    'Financial Needs & Usage',
    2, 1, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is the proposed valuation, and is it justified?',
    'The Financials',
    'Financial Needs & Usage',
    2, 1, 3,
    true,
    'textarea'
);

-- SUB-SECTION: Financial and Strategic Understanding
INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'Do you clearly understand your financial metrics (e.g., revenue, expenses, cash flow)?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 2, 0,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is your business scaling strategy, and how will you fund growth?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 2, 1,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'How do you prioritize spending and allocate resources?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 2, 2,
    true,
    'textarea'
);

INSERT INTO project_questions (
    question,
    section,
    sub_section,
    section_order,
    sub_section_order,
    question_order,
    required,
    input_type
) VALUES (
    'What is your exit strategy, and how does it align with investor expectations?',
    'The Financials',
    'Financial and Strategic Understanding',
    2, 2, 3,
    true,
    'textarea'
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_questions;
-- +goose StatementEnd
