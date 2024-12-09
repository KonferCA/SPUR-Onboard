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

-- clean up existing projects
DELETE FROM project_links;
DELETE FROM project_comments;
DELETE FROM project_files;
DELETE FROM projects;

-- add demo projects
WITH company_data AS (
    SELECT id, name FROM companies
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
        'TechVision AI',
        'Autonomous Parking System',
        'AI-powered system for automated parallel and perpendicular parking',
        'in_progress',
        45,
        2
    ),
    (
        'TechVision AI',
        'Traffic Pattern Analysis',
        'Real-time traffic analysis using computer vision',
        'completed',
        90,
        30
    ),
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

-- add project links
WITH project_data AS (
    SELECT p.id, p.title, c.name as company_name
    FROM projects p
    JOIN companies c ON p.company_id = c.id
)
INSERT INTO project_links (
    project_id,
    link_type,
    url
)
SELECT 
    pd.id,
    l.link_type,
    l.url
FROM project_data pd
CROSS JOIN (VALUES
    (
        'TechVision AI',
        'Autonomous Parking System',
        'github',
        'https://github.com/techvision/parking-ai'
    ),
    (
        'TechVision AI',
        'Autonomous Parking System',
        'demo',
        'https://demo.techvision.ai/parking'
    ),
    (
        'GreenEnergy Solutions',
        'Solar Panel Efficiency Optimizer',
        'documentation',
        'https://docs.greenenergy.com/solar-optimizer'
    )
) AS l(company_name, project_title, link_type, url)
WHERE pd.company_name = l.company_name AND pd.title = l.project_title;

-- add project comments
WITH project_data AS (
    SELECT p.id as project_id, 
           u.id as user_id,
           p.title as project_title,
           c.name as company_name
    FROM projects p
    JOIN companies c ON p.company_id = c.id
    CROSS JOIN users u
)
INSERT INTO project_comments (
    project_id,
    user_id,
    comment,
    created_at
)
SELECT 
    pd.project_id,
    pd.user_id,
    pc.comment,
    NOW() - (pc.days_ago || ' days')::INTERVAL
FROM project_data pd
CROSS JOIN (VALUES
    (
        'TechVision AI',
        'Autonomous Parking System',
        'investor@test.com',
        'This looks great!',
        5
    ),
    (
        'TechVision AI',
        'Autonomous Parking System',
        'startup@test.com',
        'YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
        4
    ),
    (
        'GreenEnergy Solutions',
        'Solar Panel Efficiency Optimizer',
        'investor@test.com',
        'This sucks. :(',
        3
    )
) AS pc(company_name, project_title, user_email, comment, days_ago)
WHERE pd.company_name = pc.company_name 
  AND pd.project_title = pc.project_title
  AND EXISTS (SELECT 1 FROM users u WHERE u.id = pd.user_id AND u.email = pc.user_email); 