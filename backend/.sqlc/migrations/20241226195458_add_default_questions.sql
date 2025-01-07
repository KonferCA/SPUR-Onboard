-- +goose Up
-- +goose StatementBegin
-- alter project questions table to include a sub-section column
-- sub-section helps organize questions into smaller groups (how they are grouped in UI/UX)
ALTER TABLE IF EXISTS project_questions
ADD COLUMN sub_section VARCHAR(255) NOT NULL;

-- enum type for different input types
CREATE TYPE input AS ENUM (
    'textinput', -- single line input
    'textarea', -- multi-line input
    'select', -- single selection/dropdown input
    'checkbox', -- checkbox question with one or more choices
    'radio', -- single selection with one or more choices
    'team', -- team creation input
    'file' -- file upload input
);
-- alter project questions table to include the type of input the question is for frontend use.
ALTER TABLE IF EXISTS project_questions
ADD COLUMN input_type input NOT NULL;

-- alter project questions table to include optional options for input types: checkboxes, select, radio
ALTER TABLE IF EXISTS project_questions
ADD COLUMN options VARCHAR(255)[];

-- seed database with initial default questions

-- SECTION: The Basics
INSERT INTO project_questions (question, section, sub_section, input_type, required, validations) VALUES 
    -- SUB-SECTION: Business Overview
    ('What is the core product or service, and what problem does it solve?', 'The Basics', 'Business Overview', 'textarea', true, ''),
    ('What is the unique value proposition?', 'The Basics', 'Business Overview', true, ''),
    ('What is the size and growth rate of the target market?', 'The Basics', 'Business Overview', 'textarea', true, ''),
    ('Who are the main competitors, and how is the business differentiated from them?', 'The Basics', 'Business Overview', 'textarea', true, ''),

    -- SUB-SECTION: Market Analysis
    ('Who are the target customers, and what are their needs?', 'The Basics', 'Market Analysis', 'textarea', true, ''),
    ('What is the total addressable market (TAM), and how much can the startup realistically capture?', 'The Basics', 'Market Analysis', 'textarea', true, ''),
    ('What are the main market trends and drivers?', 'The Basics', 'Market Analysis', 'textarea', true, ''),
    ('What are the main market trends and drivers?', 'The Basics', 'Market Analysis', 'textarea', true, ''),
    ('Are there any significant barriers to entry or competitive advantages?', 'The Basics', 'Market Analysis', 'textarea', true, ''),

    -- SUB-SECTION: Product or Service
    ('What stage of development is the product in (idea, prototype, MVP, production)?', 'The Basics', 'Product or Service', 'textarea', true, ''),
    ('What feedback has been received from early customers or beta users?', 'The Basics', 'Product or Service', 'textarea', true, ''),
    ('Are any intellectual property (IP) protections, such as patents or trademarks in place?', 'The Basics', 'Product or Service', 'textarea', true, ''),
    ('How scalable is the product/service?', 'The Basics', 'Product or Service', 'textarea', true, ''),

    -- SUB-SECTION: Traction
    ('How many customers or users does the startup currently have?', 'The Basics', 'Traction', 'textarea', true, ''),
    ('Are there partnerships, contracts, or letters of interest in place?', 'The Basics', 'Traction', 'textarea', true, ''),
    ('Has the startup received media coverage, awards, or endorsements?', 'The Basics', 'Traction', 'textarea', true, ''),
    ('What milestones has the startup achieved so far?', 'The Basics', 'Traction', 'textarea', true, ''),

    -- SUB-SECTION: Risks and Challenges
    ('What are the major risks (market, operational, competitive, regulatory)?', 'The Basics', 'Risks and Challenges', 'textarea', true, ''),
    ('How does the startup plan to mitigate these risks?', 'The Basics', 'Risks and Challenges', 'textarea', true, ''),
    ('Are there any pending legal or compliance issues?', 'The Basics', 'Risks and Challenges', 'textarea', true, ''),
    ('Are there any key dependencies (e.g., suppliers, technology)?', 'The Basics', 'Risks and Challenges', 'textarea', true, ''),

    -- SUB-SECTION: Exit Strategy
    ('What is the long-term vision for the business?', 'The Basics', 'Exit Strategy', 'textarea', true, ''),
    ('Does the startup have a defined exit strategy (e.g., acquisition, IPO)?', 'The Basics', 'Exit Strategy', 'textarea', true, ''),
    ('Are there potential acquirers or exit opportunities in the market?', 'The Basics', 'Exit Strategy', 'textarea', true, ''),
    ('What is the projected return on investment (ROI) for investors?', 'The Basics', 'Exit Strategy', 'textarea', true, ''),

    -- SUB-SECTION: Alignment and Impact
    ('Does the startup align with SPUR’s values and mission?', 'The Basics', 'Alignment and Impact', 'textarea', true, ''),
    ('What is the potential for a positive impact?', 'The Basics', 'Alignment and Impact', 'textarea', true, ''),
    ('What is their mission?', 'The Basics', 'Alignment and Impact', 'textarea', true, ''),
    ('How does the startup contribute to local or global communities?', 'The Basics', 'Alignment and Impact', 'textarea', true, ''),

    -- SUB-SECTION: Legal and Compliance
    ('Is the company properly registered and in good legal standing?', 'The Basics', 'Legal and Compliance', 'textarea', true, ''),
    ('Are the ownership and equity structures clear and documented?', 'The Basics', 'Legal and Compliance', 'textarea', true, ''),
    ('Are there any outstanding legal disputes or liabilities?', 'The Basics', 'Legal and Compliance', 'textarea', true, ''),
    ('Does the company comply with industry-specific regulations?', 'The Basics', 'Legal and Compliance', 'textarea', true, ''),

    -- SUB-SECTION: Strategic Fit with SPUR
    ('How does the startup align with SPUR’s strategic priorities and goals?', 'The Basics', 'Strategic Fit with SPUR', 'textarea', true, ''),
    ('Are there potential synergies with other startups or partners from SPUR?', 'The Basics', 'Strategic Fit with SPUR', 'textarea', true, ''),
    ('Can SPUR provide unique value beyond funding (e.g., mentorship, networking)?', 'The Basics', 'Strategic Fit with SPUR', 'textarea', true, '');

-- SECTION: The Team
INSERT INTO project_questions (question, section, sub_section, input_type, required, validations) VALUES 
    -- SUB-SECTION: Team Members
    ('', 'The Team', 'Team Members', 'team', false, ''),

    -- SUB-SECTION: Team Background
    ('Who are the founders and key team members, and what are their backgrounds?', 'The Team', 'Team Background', 'textarea', true, ''),
    ('Do they have relevant experience in the industry?', 'The Team', 'Team Background', 'textarea', true, ''),
    ('How committed are the founders (e.g., full-time, personal investment)?', 'The Team', 'Team Background', 'textarea', true, ''),
    ('Does the team have a balanced skill set (technical, operational, marketing, finance)?', 'The Team', 'Team Background', 'textarea', true, ''),

    -- SUB-SECTION: Personal Background
    ('What is your professional and educational background?', 'The Team', 'Personal Background', 'textarea', true, ''),
    ('What relevant experience do you have in this industry or market?', 'The Team', 'Personal Background', 'textarea', true, ''),
    ('Have you successfully launched or managed any startups or businesses before? If so, what were the outcomes?', 'The Team', 'Personal Background', 'textarea', true, ''),
    ('What lessons did you learn from your previous ventures, both successful and unsuccessful?', 'The Team', 'Personal Background', 'textarea', true, ''),
    ('How well do you understand the technical and operational aspects of your business?', 'The Team', 'Personal Background', 'textarea', true, ''),

    -- SUB-SECTION: Vision and Motivation
    ('What inspired you to start this business?', 'The Team', 'Vision and Motivation', 'textarea', true, ''),
    ('What is the long-term vision for the company, and how do you plan to achieve it?', 'The Team', 'Vision and Motivation', 'textarea', true, ''),
    ('What motivates you to continue pursuing this business, especially during challenging times?', 'The Team', 'Vision and Motivation', 'textarea', true, ''),
    ('How do you measure success for yourself and your business?', 'The Team', 'Vision and Motivation', 'textarea', true, ''),

    -- SUB-SECTION: Leadership
    ('What is your leadership style?', 'The Team', 'Leadership', 'textarea', true, ''),
    ('How do you manage and motivate your team?', 'The Team', 'Leadership', 'textarea', true, ''),
    ('How do you handle conflict within the team and/or with external stakeholders?', 'The Team', 'Leadership', 'textarea', true, ''),
    ('Are you comfortable delegating responsibilities, or do you tend to take on too much yourself?', 'The Team', 'Leadership', 'textarea', true, ''),
    ('What processes do you have in place to attract, retain, and develop talent?', 'The Team', 'Leadership', 'textarea', true, ''),

    -- SUB-SECTION: Personal Commitment
    ('How committed are you to this venture?', 'The Team', 'Personal Commitment', 'textarea', true, ''),
    ('How much personal capital have you invested in the business?', 'The Team', 'Personal Commitment', 'textarea', true, ''),
    ('Are there any other obligations or ventures that could divide your focus?', 'The Team', 'Personal Commitment', 'textarea', true, ''),
    ('How long do you see yourself staying actively involved in the business?', 'The Team', 'Personal Commitment', 'textarea', true, ''),

    -- SUB-SECTION: Knowledge and Preparedness
    ('How well do you understand your target market, customer needs, and competitive landscape?', 'The Team', 'Knowledge and Preparedness', 'textarea', true, ''),
    ('What research or validation have you done to confirm demand for your product or service?', 'The Team', 'Knowledge and Preparedness', 'textarea', true, ''),
    ('Do you have a roadmap for the next 12 months, 3 years, and 5 years?', 'The Team', 'Knowledge and Preparedness', 'textarea', true, ''),
    ('What contingencies have you planned for potential risks or challenges?', 'The Team', 'Knowledge and Preparedness', 'textarea', true, ''),

    -- SUB-SECTION: Problem-Solving and Resillience
    ('Can you share an example of a major challenge you’ve faced and how you resolved it', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, ''),
    ('How do you make decisions under pressure or with incomplete information?', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, ''),
    ('What are the biggest risks to your business, and how do you plan to mitigate them', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, ''),
    ('How do you handle setbacks or failures?', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, ''),
    ('Relationships and Networking', 'The Team', 'Problem-Solving and Resillience', 'checkbox', true, ''),
    ('Can you share an example of a major challenge you’ve faced and how you resolved it', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, ''),
    ('Can you share an example of a major challenge you’ve faced and how you resolved it', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, ''),
    ('Can you share an example of a major challenge you’ve faced and how you resolved it', 'The Team', 'Problem-Solving and Resillience', 'textarea', true, '');

-- TODO: add remaining questions for problem solving
-- TODO: design new schema that can represent the different types of inputs for each question.

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM project_questions WHERE section = 'business_overview'; 

ALTER TABLE IF EXISTS project_questions
DROP COLUMN input_type;

ALTER TABLE IF EXISTS project_questions
DROP COLUMN sub_section;
-- +goose StatementEnd
