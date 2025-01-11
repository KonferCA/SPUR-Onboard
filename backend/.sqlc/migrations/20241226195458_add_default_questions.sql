-- +goose Up
-- +goose StatementBegin

-- alter project questions table to include a sub-section column
-- sub-section helps organize questions into smaller groups (how they are grouped in UI/UX)
ALTER TABLE IF EXISTS project_questions
ADD COLUMN sub_section VARCHAR(255) NOT NULL;

-- alter project questions table to include the type of input the question is for frontend use.
ALTER TABLE IF EXISTS project_questions
ADD COLUMN input_type VARCHAR(255) NOT NULL;

-- alter project questions table to include optional options for input types: checkboxes, select, radio
ALTER TABLE IF EXISTS project_questions
ADD COLUMN options VARCHAR(255)[];

-- seed database with initial default questions

-- SECTION: The Basics
INSERT INTO project_questions (sub_section_order, question, section, sub_section, input_type, options, required, validations) VALUES 
    -- SUB-SECTION: Company Pitch
    (0, 'Include a link to a 5-minute video of you or your company pitching itself.', 'The Basics', 'Company Pitch', 'textinput', NULL, false, 'url'),
    (1, 'Please upload a pitch deck.', 'The Basics', 'Company Pitch', 'textinput|file', NULL, false, 'url'),

    -- SUB-SECTION: Business Overview
    (0, 'What is the core product or service, and what problem does it solve?', 'The Basics', 'Business Overview', 'textarea', NULL, true, ''),
    (1, 'What is the unique value proposition?', 'The Basics', 'Business Overview', 'textarea', NULL, true, ''),
    (2, 'Who are the main competitors, and how is the business differentiated from them?', 'The Basics', 'Business Overview', 'textarea', NULL, true, ''),
    (3, 'What is the company''s mission?', 'The Basics', 'Business Overview', 'textinput', NULL, true, ''),
    (4, 'What is the company''s business plan?', 'The Basics', 'Business Overview', 'textinput|file', NULL, true, ''),

    -- SUB-SECTION: Market Analysis & Research
    (0, 'Who are the target customers, and what are their needs?', 'The Basics', 'Market Analysis & Research', 'textarea', NULL, true, ''),
    (1, 'What is the size and growth rate of the target market?', 'The Basics', 'Market Analysis & Research', 'textarea', NULL, true, ''),
    (2, 'What is the total addressable market (TAM), and how much can the startup realistically capture?', 'The Basics', 'Market Analysis & Research', 'textarea', NULL, true, ''),
    (3, 'What are the main market trends and drivers?', 'The Basics', 'Market Analysis & Research', 'textarea', NULL, false, ''),
    (4, 'Are there any significant barriers to entry or competitive advantages?', 'The Basics', 'Market Analysis & Research', 'textarea', NULL, false, ''),
    (5, 'Do you have any market research-related documents you''d like to inlcude?', 'The Basics', 'Market Analysis & Research', 'textinput|file', NULL, false, 'url'),
    (6, 'Do you have any customer data-related documents you''d like to include?', 'The Basics', 'Market Analysis & Research', 'textinput|file', NULL, false, 'url'),

    -- SUB-SECTION: Product or Service
    (0, 'What stage of development is the product in (idea, prototype, MVP, production)?', 'The Basics', 'Product or Service', 'select', '{Idea,Prototype,MVP,Production}', true, ''),
    (1, 'How scalable is the product/service?', 'The Basics', 'Product or Service', 'textarea', NULL, true, ''),
    (2, 'What feedback has been received from early customers or beta users?', 'The Basics', 'Product or Service', 'textarea', NULL, false, ''),
    (3, 'Are any intellectual property (IP) protections, such as patents or trademarks in place?', 'The Basics', 'Product or Service', 'textarea', NULL, false, ''),

    -- SUB-SECTION: Traction
    (0, 'How many customers or users does the startup currently have?', 'The Basics', 'Traction', 'textarea', NULL, true, ''),
    (1, 'Are there partnerships in place?', 'The Basics', 'Traction', 'textarea', NULL, true, ''),
    (2, 'Has the startup received media coverage, awards, or endorsements?', 'The Basics', 'Traction', 'textarea', NULL, true, ''),
    (3, 'What milestones has the startup achieved so far?', 'The Basics', 'Traction', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Risks and Challenges
    (0, 'What are the major risks (market, operational, competitive, regulatory)?', 'The Basics', 'Risks and Challenges', 'textarea', NULL, true, ''),
    (1, 'How does the startup plan to mitigate these risks?', 'The Basics', 'Risks and Challenges', 'textarea', NULL, true, ''),
    (2, 'Are there any key dependencies (e.g., suppliers, technology)?', 'The Basics', 'Risks and Challenges', 'textinput', NULL, true, ''),

    -- SUB-SECTION: Exit Strategy
    (0, 'What is the long-term vision for the business?', 'The Basics', 'Exit Strategy', 'textarea', NULL, true, ''),
    (1, 'Does the startup have a defined exit strategy (e.g., acquisition, IPO)?', 'The Basics', 'Exit Strategy', 'textarea', NULL, true, ''),
    (2, 'Are there potential acquirers or exit opportunities in the market?', 'The Basics', 'Exit Strategy', 'textinput', NULL, false, ''),
    (3, 'What is the projected return on investment (ROI) for investors?', 'The Basics', 'Exit Strategy', 'textarea', NULL, false, ''),

    -- SUB-SECTION: Alignment and Impact
    (0, 'Does the startup align with SPUR’s values and mission?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),
    (1, 'How does the startup align with SPUR''s strategic priorities and goals?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),
    (2, 'Are there potential synergies with other startups or partners from SPUR?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),
    (3, 'Can SPUR provide unique value beyond funding (e.g., mentorship, networking)?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),
    (4, 'Are you open to mentorship, guidance or collaboration from SPUR or its network?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),
    (5, 'What is the potential for a positive impact?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),
    (6, 'How does the startup contribute to local or global communities?', 'The Basics', 'Alignment and Impact', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Legal and Compliance
    (0, 'Is the company properly registered and in good legal standing?', 'The Basics', 'Legal and Compliance', 'textinput', NULL, true, ''),
    (1, 'Are the ownership and equity structures clear and documented?', 'The Basics', 'Legal and Compliance', 'textinput', NULL, true, ''),
    (2, 'Are there any outstanding legal disputes or liabilities?', 'The Basics', 'Legal and Compliance', 'textinput', NULL, true, ''),
    (3, 'Does the company comply with industry-specific regulations?', 'The Basics', 'Legal and Compliance', 'textinput', NULL, true, ''),
    (4, 'Do you have any contracts, agreements, or letters of intent you''d like to include?', 'The Basics', 'Legal and Compliance', 'textinput|file', NULL, false, 'url');

-- SECTION: The Team
INSERT INTO project_questions (sub_section_order, question, section, sub_section, input_type, options, required, validations) VALUES 
    -- SUB-SECTION: Team Members
    (0, '', 'The Team', 'Team Members', 'team', NULL, true, ''),

    -- SUB-SECTION: Team Background
    (0, 'Who are the founders and key team members, and what are their backgrounds?', 'The Team', 'Team Background', 'textarea', NULL, true, ''),
    (1, 'Do they have relevant experience in the industry?', 'The Team', 'Team Background', 'textarea', NULL, true, ''),
    (2, 'How committed are the founders (e.g., full-time, personal investment)?', 'The Team', 'Team Background', 'textarea', NULL, true, ''),
    (3, 'Does the team have a balanced skill set (technical, operational, marketing, finance)?', 'The Team', 'Team Background', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Personal Background
    (0, 'What is your professional and educational background?', 'The Team', 'Personal Background', 'textarea', NULL, true, ''),
    (1, 'What relevant experience do you have in this industry or market?', 'The Team', 'Personal Background', 'textarea', NULL, true, ''),
    (2, 'Have you successfully launched or managed any startups or businesses before? If so, what were the outcomes?', 'The Team', 'Personal Background', 'textarea', NULL, true, ''),
    (3, 'What lessons did you learn from your previous ventures, both successful and unsuccessful?', 'The Team', 'Personal Background', 'textarea', NULL, true, ''),
    (4, 'How well do you understand the technical and operational aspects of your business?', 'The Team', 'Personal Background', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Vision and Motivation
    (0, 'What inspired you to start this business?', 'The Team', 'Vision and Motivation', 'textarea', NULL, true, ''),
    (1, 'What is the long-term vision for the company, and how do you plan to achieve it?', 'The Team', 'Vision and Motivation', 'textarea', NULL, true, ''),
    (2, 'What motivates you to continue pursuing this business, especially during challenging times?', 'The Team', 'Vision and Motivation', 'textarea', NULL, true, ''),
    (3, 'How do you measure success for yourself and your business?', 'The Team', 'Vision and Motivation', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Leadership
    (0, 'What is your leadership style?', 'The Team', 'Leadership', 'textarea', NULL, true, ''),
    (1, 'How do you manage and motivate your team?', 'The Team', 'Leadership', 'textarea', NULL, true, ''),
    (2, 'How do you handle conflict within the team and/or with external stakeholders?', 'The Team', 'Leadership', 'textarea', NULL, true, ''),
    (3, 'Are you comfortable delegating responsibilities, or do you tend to take on too much yourself?', 'The Team', 'Leadership', 'textarea', NULL, true, ''),
    (4, 'What processes do you have in place to attract, retain, and develop talent?', 'The Team', 'Leadership', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Personal Commitment
    (0, 'How committed are you to this venture?', 'The Team', 'Personal Commitment', 'textarea', NULL, true, ''),
    (1, 'How much personal capital have you invested in the business?', 'The Team', 'Personal Commitment', 'textarea', NULL, true, ''),
    (2, 'Are there any other obligations or ventures that could divide your focus?', 'The Team', 'Personal Commitment', 'textarea', NULL, true, ''),
    (3, 'How long do you see yourself staying actively involved in the business?', 'The Team', 'Personal Commitment', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Knowledge and Preparedness
    (0, 'How well do you understand your target market, customer needs, and competitive landscape?', 'The Team', 'Knowledge and Preparedness', 'textarea', NULL, true, ''),
    (1, 'What research or validation have you done to confirm demand for your product or service?', 'The Team', 'Knowledge and Preparedness', 'textarea', NULL, true, ''),
    (2, 'Do you have a roadmap for the next 12 months, 3 years, and 5 years?', 'The Team', 'Knowledge and Preparedness', 'textarea', NULL, true, ''),
    (3, 'What contingencies have you planned for potential risks or challenges?', 'The Team', 'Knowledge and Preparedness', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Problem-Solving and Resillience
    (0, 'Can you share an example of a major challenge you’ve faced and how you resolved it', 'The Team', 'Problem-Solving and Resillience', 'textarea', NULL, true, ''),
    (1, 'How do you make decisions under pressure or with incomplete information?', 'The Team', 'Problem-Solving and Resillience', 'textarea', NULL, true, ''),
    (2, 'What are the biggest risks to your business, and how do you plan to mitigate them', 'The Team', 'Problem-Solving and Resillience', 'textarea', NULL, true, ''),
    (3, 'How do you handle setbacks or failures?', 'The Team', 'Problem-Solving and Resillience', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Relationships and Networking
    (0, 'What key partnerships, relationships, or networks have you built to support your business?', 'The Team', 'Relationships and Networking', 'textarea', NULL, true, ''),
    (1, 'How do you approach building relationships with customers, suppliers, and investors?', 'The Team', 'Relationships and Networking', 'textarea', NULL, true, ''),
    (2, 'Are you active in relevant industry communities or events?', 'The Team', 'Relationships and Networking', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Personality and Soft Skills
    (0, 'How would your team describe your management style and personality?', 'The Team', 'Personality and Soft Skilss', 'textarea', NULL, true, ''),
    (1, 'How do you handle feedback or criticism?', 'The Team', 'Personality and Soft Skilss', 'textarea', NULL, true, ''),
    (2, 'What are your leadership strengths, and what areas are you actively working to improve?', 'The Team', 'Personality and Soft Skilss', 'textarea', NULL, true, ''),
    (3, 'How do you maintain your focus and energy while balancing the demands of entrepreneurship?', 'The Team', 'Personality and Soft Skilss', 'textarea', NULL, true, '');

-- SECTION: The History nothing in notion yet
-- INSERT INTO project_questions (question, section, sub_section, input_type, required, validations) VALUES

-- SECTION: The Financials
INSERT INTO project_questions (sub_section_order, question, section, sub_section, input_type, options, required, validations) VALUES
    -- SUB-SECTION: Financial and Strategic Understanding
    (0, 'Do you clearly understand your financial metrics (e.g., revenue, expenses, cash flow)?', 'The Financials', 'Financial and Strategic Understanding', 'textarea', NULL, true, ''),
    (1, 'What is your business scaling strategy, and how will you fund growth?', 'The Financials', 'Financial and Strategic Understanding', 'textarea', NULL, true, ''),
    (2, 'How do you prioritize spending and allocate resources?', 'The Financials', 'Financial and Strategic Understanding', 'textarea', NULL, true, ''),
    (3, 'What is your exit strategy, and how does it align with investor expectations?', 'The Financials', 'Financial and Strategic Understanding', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Financial Overview
    (0, 'What is the current revenue and growth rate?', 'The Financials', 'Financial Overview', 'textarea', NULL, true, ''),
    (1, 'What are the gross and net profit margins?', 'The Financials', 'Financial Overview', 'textarea', NULL, true, ''),
    (2, 'What is the customer acquisition cost (CAC) and lifetime value (LTV)?', 'The Financials', 'Financial Overview', 'textarea', NULL, true, ''),
    (3, 'Are the financial projections realistic and based on credible assumptions?', 'The Financials', 'Financial Overview', 'textarea', NULL, true, ''),
    (4, 'What is the current burn rate, and how much runway is left?', 'The Financials', 'Financial Overview', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Financial Needs & Usage
    (0, 'How much funding is the startup seeking, and what will it be used for?', 'The Financials', 'Financial Needs & Usage', 'textarea', NULL, true, ''),
    (1, 'What milestones will the funding help achieve?', 'The Financials', 'Financial Needs & Usage', 'textarea', NULL, true, ''),
    (2, 'Are there other sources of funding (e.g., grants, loans, existing investors)?', 'The Financials', 'Financial Needs & Usage', 'textarea', NULL, true, ''),
    (3, 'What is the proposed valuation, and is it justified?', 'The Financials', 'Financial Needs & Usage', 'textarea', NULL, true, ''),

    -- SUB-SECTION: Documents
    (0, 'Cap table', 'The Financials', 'Documents', 'file', NULL, true, ''),
    (1, 'Income statement', 'The Financials', 'Documents', 'file', NULL, true, ''),
    (2, 'Balance sheet', 'The Financials', 'Documents', 'file', NULL, true, ''),
    (3, 'Cash flow', 'The Financials', 'Documents', 'file', NULL, true, '');

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_questions; 

ALTER TABLE IF EXISTS project_questions
DROP COLUMN options;

ALTER TABLE IF EXISTS project_questions
DROP COLUMN input_type;

ALTER TABLE IF EXISTS project_questions
DROP COLUMN sub_section;
-- +goose StatementEnd
