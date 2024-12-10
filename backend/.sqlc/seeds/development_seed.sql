-- development seed data

-- clean up any existing seed accounts
DELETE FROM users WHERE email IN ('admin@spur.com', 'startup@test.com', 'investor@test.com');

-- create admin user
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    email_verified,
    token_salt
) VALUES (
    'admin@spur.com',
    -- hash for 'admin123'
    '$2a$10$jltnaECAYSCQozp5UNZi7OZQlyuTR3sJFj5Hr1nLEVmI9uSAxDKnq',
    'Admin',
    'User',
    'admin',
    true,
    gen_random_bytes(32)
);

-- create startup owner
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    email_verified,
    token_salt
) VALUES (
    'startup@test.com',
    -- hash for 'startup123'
    '$2a$10$Cu72xg8m59GjDHKiFzK7pO8rLYjFL7XsPD6YezNkyZw8ItZBSnvfy',
    'Startup',
    'Owner',
    'startup_owner',
    true,
    gen_random_bytes(32)
);

-- create investor
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    email_verified,
    token_salt
) VALUES (
    'investor@test.com',
    -- hash for 'investor123'
    '$2a$10$/7Mq7D4hlh0zisjOryL.KeeWSUU30tL5mJdYLAjcqeOodSPrbB.hK',
    'Test',
    'Investor',
    'investor',
    true,
    gen_random_bytes(32)
);

-- clean up existing demo data
DELETE FROM employees WHERE email IN (
    'john@techvision.ai',
    'sarah@techvision.ai',
    'michael@greenenergy.com',
    'lisa@greenenergy.com'
);
DELETE FROM companies WHERE name IN (
    'TechVision AI',
    'GreenEnergy Solutions',
    'HealthTech Pro',
    'EduLearn Platform',
    'FinTech Solutions'
);

-- get the startup owner's user id and create demo companies
WITH startup_user AS (
    SELECT id FROM users WHERE email = 'startup@test.com' LIMIT 1
)
-- create demo companies
INSERT INTO companies (
    id,
    owner_user_id,
    name,
    description,
    is_verified,
    industry,
    company_stage,
    founded_date,
    created_at,
    updated_at
) 
SELECT
    gen_random_uuid(),
    startup_user.id,
    name,
    description,
    is_verified,
    industry,
    company_stage,
    founded_date::DATE,
    created_at,
    updated_at
FROM startup_user, (VALUES
    (
        'TechVision AI',
        'An AI company focusing on computer vision solutions for autonomous vehicles',
        true,
        'artificial_intelligence',
        'seed',
        '2022-03-15',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'GreenEnergy Solutions',
        'Developing innovative solar panel technology for residential use',
        true,
        'cleantech',
        'series_a',
        '2021-06-01',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        'HealthTech Pro',
        'Healthcare technology focusing on remote patient monitoring',
        false,
        'healthcare',
        'pre_seed',
        '2023-11-30',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        'EduLearn Platform',
        'Online education platform with AI-powered personalized learning',
        true,
        'education',
        'seed',
        '2022-09-01',
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '10 days'
    ),
    (
        'FinTech Solutions',
        'Blockchain-based payment solutions for cross-border transactions',
        false,
        'fintech',
        'pre_seed',
        '2024-01-15',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    )
) AS t(name, description, is_verified, industry, company_stage, founded_date, created_at, updated_at);

-- add company financials
WITH companies_to_update AS (
    SELECT id, name FROM companies 
    WHERE name IN ('TechVision AI', 'GreenEnergy Solutions', 'EduLearn Platform')
)
INSERT INTO company_financials (
    company_id,
    financial_year,
    revenue,
    expenses,
    profit,
    sales,
    amount_raised,
    arr,
    grants_received
)
SELECT 
    id,
    2023,
    1000000.00,  -- revenue
    800000.00,   -- expenses
    200000.00,   -- profit
    1200000.00,  -- sales
    500000.00,   -- amount raised
    960000.00,   -- arr
    50000.00     -- grants
FROM companies_to_update;

-- add employees
WITH companies_to_update AS (
    SELECT id, name FROM companies 
    WHERE name IN ('TechVision AI', 'GreenEnergy Solutions')
)
INSERT INTO employees (
    company_id,
    name,
    email,
    role,
    bio
)
SELECT 
    c.id,
    e.name,
    e.email,
    e.role,
    e.bio
FROM companies_to_update c
CROSS JOIN (VALUES
    (
        'John Smith',
        'john@techvision.ai',
        'CTO',
        'Experienced AI researcher with 10+ years in computer vision'
    ),
    (
        'Sarah Johnson',
        'sarah@techvision.ai',
        'Lead Engineer',
        'Senior software engineer specializing in deep learning'
    ),
    (
        'Michael Green',
        'michael@greenenergy.com',
        'CEO',
        'Serial entrepreneur with background in renewable energy'
    ),
    (
        'Lisa Chen',
        'lisa@greenenergy.com',
        'Head of R&D',
        'PhD in Material Science with focus on solar technology'
    )
) AS e(name, email, role, bio)
WHERE 
    (c.name = 'TechVision AI' AND e.email LIKE '%techvision%') OR
    (c.name = 'GreenEnergy Solutions' AND e.email LIKE '%greenenergy%');

-- clean up existing projects and related data
DELETE FROM project_links;
DELETE FROM project_comments;
DELETE FROM project_files;
DELETE FROM project_questions;
DELETE FROM project_sections;
DELETE FROM projects;

-- add demo projects (reduced to just 2)
WITH company_data AS (
    SELECT id, name FROM companies
    WHERE name IN ('GreenEnergy Solutions', 'EduLearn Platform')
)
INSERT INTO projects (
    company_id,
    title,
    description,
    status,
    created_at,
    updated_at
)
SELECT 
    c.id,
    p.title,
    p.description,
    p.status,
    NOW() - (p.age || ' days')::INTERVAL,
    NOW() - (p.last_update || ' days')::INTERVAL
FROM company_data c
CROSS JOIN (VALUES
    (
        'GreenEnergy Solutions',
        'Solar Panel Efficiency Optimizer',
        'AI-driven system to maximize solar panel energy collection',
        'in_progress',
        30,
        5
    ),
    (
        'EduLearn Platform',
        'Adaptive Learning Algorithm',
        'Machine learning system for personalized education paths',
        'in_review',
        15,
        1
    )
) AS p(company_name, title, description, status, age, last_update)
WHERE c.name = p.company_name;

-- add project sections
WITH project_data AS (
    SELECT p.id as project_id, 
           p.title as project_title,
           c.name as company_name
    FROM projects p
    JOIN companies c ON p.company_id = c.id
)
INSERT INTO project_sections (
    id,
    project_id,
    title
)
SELECT 
    gen_random_uuid(),
    pd.project_id,
    s.section_title
FROM project_data pd
CROSS JOIN (VALUES
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Bookkeeping Details'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Company Overview'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Product Overview'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Customer & Demographic'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Financials'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Team Overview'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Social Media & Web Presence'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Bookkeeping Details'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Company Overview'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Product Overview'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Customer & Demographic'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Financials'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Team Overview'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Social Media & Web Presence')
) AS s(company_name, project_title, section_title)
WHERE pd.company_name = s.company_name 
AND pd.project_title = s.project_title;

-- add questions and answers for each section
WITH section_data AS (
    SELECT 
        ps.id as section_id,
        p.title as project_title,
        c.name as company_name,
        ps.title as section_title
    FROM project_sections ps
    JOIN projects p ON p.id = ps.project_id
    JOIN companies c ON c.id = p.company_id
)
INSERT INTO project_questions (
    section_id,
    question_text,
    answer_text
)
SELECT 
    sd.section_id,
    q.question,
    q.answer
FROM section_data sd
CROSS JOIN (VALUES
    -- Bookkeeping Details
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Bookkeeping Details', 
     'What is your company name?', 'GreenEnergy Solutions'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Bookkeeping Details', 
     'When was your company founded?', '2021-06-01'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Bookkeeping Details', 
     'What stage is your company at?', 'Series A'),

    -- Company Overview
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Company Overview', 
     'Brief description of your company', 'Developing innovative solar panel technology for residential use'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Company Overview', 
     'What inspired you to start this company, and what is the core problem you''re solving?', 
     'The inefficiency of current residential solar solutions inspired us to develop a more effective and affordable alternative for homeowners.'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Company Overview', 
     'What is your long-term vision for the company?', 
     'To revolutionize residential solar energy by making it more efficient and accessible to homeowners worldwide.'),

    -- Product Overview
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Product Overview', 
     'What is your product?', 'An AI-driven solar panel optimization system that maximizes energy collection'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Product Overview', 
     'What stage is your product in?', 'Beta testing with 100 households'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Product Overview', 
     'What is your product roadmap?', 'Q1 2024: Public launch, Q2 2024: Enterprise features, Q4 2024: International expansion'),

    -- Customer & Demographic
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Customer & Demographic', 
     'Who is your target customer?', 'Environmentally conscious homeowners in suburban areas'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Customer & Demographic', 
     'What is your market size?', '47 million households in the US alone'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Customer & Demographic', 
     'What is your go-to-market strategy?', 'Direct-to-consumer sales through partnerships with solar installers'),

    -- Financials
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Financials', 
     'What is your current revenue?', '$1.2M ARR'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Financials', 
     'What is your burn rate?', '$150K per month'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Financials', 
     'How much funding are you seeking?', '$5M Series A'),

    -- Team Overview
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Team Overview', 
     'Who are your key team members?', 'CEO: Dr. Sarah Chen (PhD in Material Science), CTO: Michael Green (15 years in renewable energy)'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Team Overview', 
     'What are your hiring plans?', 'Looking to add 5 engineers and 3 sales representatives in next 6 months'),

    -- Social Media & Web Presence
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Social Media & Web Presence', 
     'What is your website?', 'www.greenenergysolutions.com'),
    ('GreenEnergy Solutions', 'Solar Panel Efficiency Optimizer', 'Social Media & Web Presence', 
     'List your social media presence', 'Twitter: @GreenEnergySol, LinkedIn: /company/greenenergy-solutions'),

    -- Repeat similar structure for EduLearn Platform
    -- Bookkeeping Details
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Bookkeeping Details', 
     'What is your company name?', 'EduLearn Platform'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Bookkeeping Details', 
     'When was your company founded?', '2022-09-01'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Bookkeeping Details', 
     'What stage is your company at?', 'Seed'),

    -- Company Overview
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Company Overview', 
     'Brief description of your company', 'Online education platform with AI-powered personalized learning paths'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Company Overview', 
     'What inspired you to start this company, and what is the core problem you''re solving?', 
     'Traditional online learning platforms offer a one-size-fits-all approach. We saw the opportunity to use AI to create truly personalized learning experiences that adapt to each student''s pace and style.'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Company Overview', 
     'What is your long-term vision for the company?', 
     'To become the leading adaptive learning platform globally, making quality education accessible and personalized for everyone.'),

    -- Product Overview
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Product Overview', 
     'What is your product?', 'An AI-powered learning platform that creates personalized curriculum paths'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Product Overview', 
     'What stage is your product in?', 'Live with 5,000 active users across 3 universities'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Product Overview', 
     'What is your product roadmap?', 'Q1 2024: Mobile app launch, Q2 2024: Enterprise features for universities, Q3 2024: K-12 expansion'),

    -- Customer & Demographic
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Customer & Demographic', 
     'Who is your target customer?', 'Initially focusing on higher education institutions and their students, with plans to expand to K-12'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Customer & Demographic', 
     'What is your market size?', '21 million college students in the US, $350B global edtech market'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Customer & Demographic', 
     'What is your go-to-market strategy?', 'B2B2C model through partnerships with universities, followed by direct-to-consumer offerings'),

    -- Financials
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Financials', 
     'What is your current revenue?', '$450K ARR'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Financials', 
     'What is your burn rate?', '$80K per month'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Financials', 
     'How much funding are you seeking?', '$3M Seed Round'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Financials', 
     'What are your key metrics?', 'User retention: 85%, Average learning time: 45 mins/day, Course completion rate: 78%'),

    -- Team Overview
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Team Overview', 
     'Who are your key team members?', 'CEO: Dr. James Lee (Former EdTech executive), CTO: Maria Garcia (ML/AI specialist), Head of Education: Dr. Sarah Thompson (20 years in higher education)'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Team Overview', 
     'What are your hiring plans?', 'Planning to hire 4 ML engineers, 2 educational content specialists, and 2 sales representatives in next quarter'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Team Overview', 
     'Tell us about your advisors', 'Advisory board includes former university presidents, EdTech founders, and AI researchers'),

    -- Social Media & Web Presence
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Social Media & Web Presence', 
     'What is your website?', 'www.edulearn.ai'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Social Media & Web Presence', 
     'List your social media presence', 'Twitter: @EduLearnAI, LinkedIn: /company/edulearn-platform, Instagram: @edulearn.ai'),
    ('EduLearn Platform', 'Adaptive Learning Algorithm', 'Social Media & Web Presence', 
     'Do you have any press coverage?', 'Featured in TechCrunch, EdTech Magazine, and Forbes Education')
) AS q(company_name, project_title, section_title, question, answer)
WHERE sd.company_name = q.company_name 
AND sd.project_title = q.project_title
AND sd.section_title = q.section_title; 