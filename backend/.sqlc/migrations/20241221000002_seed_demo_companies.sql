-- +goose Up
-- +goose StatementBegin

-- get the startup owner's user id
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
    created_at,
    updated_at
) 
SELECT
    gen_random_uuid(),
    startup_user.id,
    name,
    description,
    is_verified,
    created_at,
    updated_at
FROM startup_user, (VALUES
    (
        'TechVision AI',
        'An AI company focusing on computer vision solutions for autonomous vehicles',
        true,
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'GreenEnergy Solutions',
        'Developing innovative solar panel technology for residential use',
        true,
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        'HealthTech Pro',
        'Healthcare technology focusing on remote patient monitoring',
        false,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        'EduLearn Platform',
        'Online education platform with AI-powered personalized learning',
        true,
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '10 days'
    ),
    (
        'FinTech Solutions',
        'Blockchain-based payment solutions for cross-border transactions',
        false,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    )
) AS t(name, description, is_verified, created_at, updated_at);

-- Add some company financials
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

-- Add some employees
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

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Delete seeded employees
DELETE FROM employees 
WHERE email IN (
    'john@techvision.ai',
    'sarah@techvision.ai',
    'michael@greenenergy.com',
    'lisa@greenenergy.com'
);

-- Delete seeded financials and companies
DELETE FROM companies 
WHERE name IN (
    'TechVision AI',
    'GreenEnergy Solutions',
    'HealthTech Pro',
    'EduLearn Platform',
    'FinTech Solutions'
);

-- +goose StatementEnd 