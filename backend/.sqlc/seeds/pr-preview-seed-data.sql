-- PR Preview Seed Data
-- This file contains test data for PR preview deployments

-- Create test users: 1 admin and 2 regular users
-- Using fixed UUIDs for predictability
INSERT INTO users (
    id, first_name, last_name, email, password,
    permissions, email_verified, bio, title, profile_picture_url
) VALUES
-- Admin user
(
    'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
    'Admin', 'User',
    'admin@example.com',
    -- This is a bcrypt hash for password: admin123
    '$2a$10$lTUyQgRYGlrQW7FbG9IdpelDzXEKLHVYadtJrYKk6zYHnGp2zGDC.',
    -- PermAdmin value (2783 = binary 0101011011111)
    2783,
    true,
    'Administrator for the preview deployment with experience in managing technology projects and overseeing platform operations.',
    'System Administrator',
    'https://randomuser.me/api/portraits/men/1.jpg'
),
-- Regular user 1 (Startup Owner)
(
    'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
    'Startup', 'Owner',
    'startup@example.com',
    -- This is a bcrypt hash for password: startup123
    '$2a$10$M4JILbCocvAMKcf.FS/I2.Mz.9NmKFNEFdGHCz7DWK9eYCQtAAkF6',
    -- PermStartupOwner value (1552 = binary 0011000010000)
    1552,
    true,
    'Serial entrepreneur with 10+ years experience in tech startups. Previously founded two successful companies with exits to major tech firms. Passionate about sustainable technology and creating impactful solutions.',
    'Founder & CEO',
    'https://randomuser.me/api/portraits/women/2.jpg'
),
-- Regular user 2 (Investor)
(
    'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8',
    'Angel', 'Investor',
    'investor@example.com',
    -- This is a bcrypt hash for password: investor123
    '$2a$10$Qpx1cUdFy9uikymsv3SOReQcFLBbNcyXiSBH1p4TLk9QvuCNw2QQG',
    -- PermInvestor value (1091 = binary 0010001000011)
    1091,
    true,
    'Angel investor with portfolio of 25+ early-stage startups. Previous exits include Series B and C rounds. Focused on sustainable technology, blockchain solutions, and healthcare innovation. Former VP at Goldman Sachs technology division.',
    'Principal Investor',
    'https://randomuser.me/api/portraits/men/3.jpg'
);

-- Add user social links
INSERT INTO user_socials (
    user_id, platform, url_or_handle
) VALUES
-- Admin user socials
(
    'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
    'linkedin',
    'https://linkedin.com/in/admin-user'
),
(
    'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
    'x',
    '@adminuser'
),
-- Startup owner socials
(
    'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
    'linkedin',
    'https://linkedin.com/in/startup-founder'
),
(
    'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
    'x',
    '@startupfounder'
),
(
    'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
    'instagram',
    '@startupfounder'
),
-- Investor socials
(
    'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8',
    'linkedin',
    'https://linkedin.com/in/angel-investor'
),
(
    'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8',
    'x',
    '@angelinvestor'
),
(
    'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8',
    'bluesky',
    'angelinvestor.blusky.com'
);

-- Create companies
INSERT INTO companies (
    id, owner_id, name, description, website, linkedin_url, 
    wallet_address, stages, date_founded, group_type
) VALUES 
-- First company
(
    'd4e5f6a7-b8c9-4ad0-e1f2-a3b4c5d6e7f8',
    'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
    'Demo Startup Inc.',
    'A revolutionary startup pioneering AI-driven solutions for healthcare, finance, and education. We leverage cutting-edge machine learning algorithms to create personalized experiences that transform how people interact with essential services.',
    'https://demo-startup-example.com',
    'https://linkedin.com/company/demo-startup',
    '0x7a3dE74463b0bf2a8fB46D8C5e633ca5D2Fd6857',
    ARRAY['Seed', 'Series A'],
    EXTRACT(epoch FROM TIMESTAMP '2022-05-15'),
    'company'
),
-- Second company
(
    'd0e1f2a3-b4c5-40d6-e7f8-a9b0c1d2e3f4',
    'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7',
    'Green Energy Solutions',
    'Innovative clean energy solutions for a sustainable future. We develop and deploy advanced solar and wind energy technologies coupled with AI-driven optimization systems that maximize efficiency while minimizing environmental impact.',
    'https://greenenergy-example.com',
    'https://linkedin.com/company/green-energy-solutions',
    '0x8b2dE85573b0bf3a8fE46D8C5e633ca5D3Ec9284',
    ARRAY['Pre-seed', 'Seed'],
    EXTRACT(epoch FROM TIMESTAMP '2023-02-10'),
    'company'
);

-- Add team members to the companies
INSERT INTO team_members (
    id, company_id, first_name, last_name, title, linkedin_url,
    is_account_owner, commitment_type, introduction, 
    industry_experience, detailed_biography, personal_website,
    previous_work, social_links
) VALUES 
-- First company team members
(
    gen_random_uuid(),
    'd4e5f6a7-b8c9-4ad0-e1f2-a3b4c5d6e7f8',
    'Startup', 'Owner',
    'CEO & Founder',
    'https://linkedin.com/in/startup-owner',
    true, 'Full-time',
    'Visionary founder with a passion for innovation and transforming industries through cutting-edge technology.',
    '12+ years in technology startups with expertise in AI, machine learning, and enterprise software.',
    'Founded multiple startups with successful exits including a healthcare AI company acquired by Microsoft and an edtech platform that raised $30M before IPO. Previously led product development at Google, focusing on AI applications. MBA from Stanford and Computer Science degree from MIT.',
    'https://startupowner-personal.com',
    'Led development of three patented AI algorithms. Keynote speaker at Web Summit and TechCrunch Disrupt. Author of "AI for Industry Transformation" published in 2022.',
    '[{"platform":"linkedin","url_or_handle":"https://linkedin.com/in/startup-owner"},{"platform":"x","url_or_handle":"@startupowner"},{"platform":"instagram","url_or_handle":"@startupowner"}]'
),
(
    gen_random_uuid(),
    'd4e5f6a7-b8c9-4ad0-e1f2-a3b4c5d6e7f8',
    'Technical', 'Co-founder',
    'CTO',
    'https://linkedin.com/in/tech-cofounder',
    false, 'Full-time',
    'Experienced engineer with a passion for building scalable, robust systems that solve real-world problems.',
    '14+ years in software development with deep expertise in cloud architecture, distributed systems, and machine learning operations.',
    'Previously led engineering teams at Google Cloud and Amazon Web Services, where I architected systems handling petabytes of data. PhD in Computer Science from UC Berkeley specializing in distributed systems. Built and scaled multiple technology platforms processing millions of transactions daily.',
    'https://techcofounder-personal.com',
    'Contributed to open-source projects including TensorFlow and Kubernetes. Holds 7 patents in distributed computing and machine learning optimization. Regular speaker at AWS re:Invent and Google Cloud Next.',
    '[{"platform":"linkedin","url_or_handle":"https://linkedin.com/in/tech-cofounder"},{"platform":"discord","url_or_handle":"@techcoder"}]'
),
-- Second company team members
(
    gen_random_uuid(),
    'd0e1f2a3-b4c5-40d6-e7f8-a9b0c1d2e3f4',
    'Green', 'Entrepreneur',
    'CEO & Founder',
    'https://linkedin.com/in/green-entrepreneur',
    true, 'Full-time',
    'Environmental scientist turned entrepreneur with a mission to accelerate the world''s transition to sustainable energy.',
    '15+ years in renewable energy sector, specializing in solar photovoltaic technology, energy storage solutions, and smart grid integration.',
    'PhD in Environmental Science from Stanford with focus on sustainable energy systems. Previously led R&D at Tesla Energy, developing advanced solar and battery technologies. Founded GreenTech Solutions which deployed over 100MW of solar capacity across developing markets before acquisition. Recipient of the CleanTech Innovator Award and UN Sustainable Development champion.',
    'https://green-entrepreneur.com',
    'Published over 30 research papers on renewable energy technologies. Led the development of breakthrough solar storage technology increasing efficiency by 35%. Advisor to three climate tech venture funds.',
    '[{"platform":"linkedin","url_or_handle":"https://linkedin.com/in/green-entrepreneur"},{"platform":"x","url_or_handle":"@greenenergy"},{"platform":"custom_url","url_or_handle":"https://climateaction.org/members/greenentrepreneur"}]'
),
(
    gen_random_uuid(),
    'd0e1f2a3-b4c5-40d6-e7f8-a9b0c1d2e3f4',
    'Solar', 'Engineer',
    'Chief Technical Officer',
    'https://linkedin.com/in/solar-engineer',
    false, 'Full-time',
    'Expert in solar panel technology with a focus on maximizing efficiency and durability in diverse environments.',
    '12+ years in solar energy research and development, with expertise in photovoltaic materials, energy storage integration, and smart grid technologies.',
    'MS in Materials Science from MIT specializing in next-generation solar cell materials. Previously led solar technology development at SunPower and First Solar, creating industry-leading panel designs. Developed patented manufacturing process reducing production costs by 23% while increasing energy conversion efficiency. Pioneer in perovskite solar cell research with practical commercial applications.',
    'https://solar-innovations.tech',
    'Holds 12 patents in solar panel design and manufacturing. Led team that broke world record for solar panel efficiency in 2021. Regular contributor to Solar Energy Journal and IEEE Transactions on Sustainable Energy.',
    '[{"platform":"linkedin","url_or_handle":"https://linkedin.com/in/solar-engineer"},{"platform":"x","url_or_handle":"@solarinnovator"},{"platform":"discord","url_or_handle":"@solartech"}]'
);
