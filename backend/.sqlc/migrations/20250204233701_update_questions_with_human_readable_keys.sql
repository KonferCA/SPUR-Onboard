-- +goose Up
-- +goose StatementBegin
-- Update existing rows with slugified question text
UPDATE project_questions
SET question_key =
CASE
    WHEN question = 'What is the name of your company?' THEN 'company_name'
    WHEN question = 'When was your company founded?' THEN 'company_founding_date'
    WHEN question = 'What stage is your company at?' THEN 'company_stage'
    WHEN question = 'What investment stage is your company at?' THEN 'investment_stage'
    WHEN question = 'Include a link to a 5-minute video of you or your company pitching itself.' THEN 'pitch_video_link'
    WHEN question = 'Please upload a pitch deck.' AND input_type = 'textinput' THEN 'pitch_deck_link'
    WHEN question = 'Please upload a pitch deck.' AND input_type = 'file' THEN 'pitch_deck_file'
    WHEN question = 'What is the core product or service, and what problem does it solve?' THEN 'core_product_problem'
    WHEN question = 'What is the unique value proposition?' THEN 'value_proposition'
    WHEN question = 'What is the company''s mission?' THEN 'company_mission'
    WHEN question = 'What is the company''s business plan?' AND input_type = 'textinput' THEN 'business_plan_text'
    WHEN question = 'What is the company''s business plan?' AND input_type = 'file' THEN 'business_plan_file'
    WHEN question = 'Who are the target customers, and what are their needs?' THEN 'target_customers'
    WHEN question = 'Who are the main competitors, and how is the business differentiated from them' THEN 'competitors_differentiation'
    WHEN question = 'What is the size and growth rate of the target market?' THEN 'market_size_growth'
    WHEN question = 'What is the total addressable market (TAM), and how much can the startup realistically capture?' THEN 'tam_capture'
    WHEN question = 'What are the main market trends and drivers?' THEN 'market_trends'
    WHEN question = 'Are there any significant barriers to entry or competitive advantages?' THEN 'barriers_advantages'
    WHEN question = 'Do you have any market research-related documents you''d like to inlcude?' AND input_type = 'textinput' THEN 'market_research_link'
    WHEN question = 'Do you have any market research-related documents you''d like to inlcude?' AND input_type = 'file' THEN 'market_research_file'
    WHEN question = 'Do you have any customer data-related documents you''d like to include?' AND input_type = 'textinput' THEN 'customer_data_link'
    WHEN question = 'Do you have any customer data-related documents you''d like to include?' AND input_type = 'file' THEN 'customer_data_file'
    WHEN question = 'What stage of development is the product in (idea, prototype, MVP, production)?' THEN 'product_stage'
    WHEN question = 'How scalable is the product/service?' THEN 'scalability'
    WHEN question = 'What feedback has been received from early customers or beta users?' THEN 'customer_feedback'
    WHEN question = 'Are any intellectual property (IP) protections, such as patents or trademarks in place?' THEN 'ip_protections'
    WHEN question = 'Are there any IP-related files you would like to upload, such as patents or trademarks?' AND input_type = 'textarea' THEN 'ip_files_text'
    WHEN question = 'Are there any IP-related files you would like to upload, such as patents or trademarks?' AND input_type = 'file' THEN 'ip_files_upload'
    WHEN question = 'How many customers or users does the startup currently have?' THEN 'customer_count'
    WHEN question = 'Are there partnerships in place?' THEN 'partnerships'
    WHEN question = 'Has the startup received media coverage, awards, or endorsements?' THEN 'media_coverage'
    WHEN question = 'What milestones has the startup achieved so far?' THEN 'milestones_achieved'
    WHEN question = 'What are the major risks (market, operational, competitive, regulatory)?' THEN 'major_risks'
    WHEN question = 'How does the startup plan to mitigate these risks?' THEN 'risk_mitigation'
    WHEN question = 'Are there any key dependencies (e.g., suppliers, technology)?' THEN 'key_dependencies'
    WHEN question = 'What is the long-term vision for the business and how do you plan to achieve it?' THEN 'long_term_vision'
    WHEN question = 'Does the startup have a defined exit strategy?' THEN 'exit_strategy'
    WHEN question = 'Please elaborate on this exit strategy' THEN 'exit_strategy_details'
    WHEN question = 'Are there potential acquirers or exit opportunities in the market?' THEN 'potential_acquirers'
    WHEN question = 'What is the projected return on investment (ROI) for investors?' THEN 'projected_roi'
    WHEN question = 'Does the startup align with SPUR''s mission, goals, strategic priorities, and values?' THEN 'spur_alignment'
    WHEN question = 'Are there potential synergies with other startups or partners from SPUR?' THEN 'spur_synergies'
    WHEN question = 'Can SPUR provide unique value beyond funding (e.g., mentorship, networking)?' THEN 'spur_value_add'
    WHEN question = 'Are you open to mentorship, guidance or collaboration from SPUR or its network?' THEN 'mentorship_openness'
    WHEN question = 'What is the potential for a positive impact?' THEN 'positive_impact'
    WHEN question = 'How does the startup contribute to local or global communities?' THEN 'community_contribution'
    WHEN question = 'Is the company properly registered and in good legal standing?' THEN 'legal_standing'
    WHEN question = 'Are the ownership and equity structures clear and documented?' THEN 'equity_structure'
    WHEN question = 'Are there any outstanding legal disputes, legal issues, compliance issues, or liabilities?' THEN 'legal_issues'
    WHEN question = 'Does the company comply with industry-specific regulations?' THEN 'regulatory_compliance'
    WHEN question = 'Do you have any contracts, agreements, or letters of intent you''d like to include?' AND input_type = 'textinput' THEN 'contracts_link'
    WHEN question = 'Do you have any contracts, agreements, or letters of intent you''d like to include?' AND input_type = 'file' THEN 'contracts_file'
    WHEN question = '' AND input_type = 'team' THEN 'team_section'
    WHEN question = 'What is your professional and educational background?' THEN 'professional_background'
    WHEN question = 'What relevant experience do you have in this industry or market?' THEN 'industry_experience'
    WHEN question = 'Have you successfully launched or managed any startups or businesses before? If so, what were the outcomes?' THEN 'previous_startups'
    WHEN question = 'What lessons did you learn from your previous ventures, both successful and unsuccessful?' THEN 'venture_lessons'
    WHEN question = 'How well do you understand the technical and operational aspects of your business?' THEN 'technical_understanding'
    WHEN question = 'What inspired you to start this business?' THEN 'business_inspiration'
    WHEN question = 'What motivates you to continue pursuing this business, especially during challenging times?' THEN 'motivation_challenges'
    WHEN question = 'How do you measure success for yourself and your business?' THEN 'success_metrics'
    WHEN question = 'What is your leadership style?' THEN 'leadership_style'
    WHEN question = 'Does the team have a balanced skill set (technical, operational, marketing, finance)?' THEN 'team_balance'
    WHEN question = 'How do you manage and motivate your team?' THEN 'team_management'
    WHEN question = 'How do you handle conflict within the team and/or with external stakeholders?' THEN 'conflict_handling'
    WHEN question = 'Are you comfortable delegating responsibilities, or do you tend to take on too much yourself?' THEN 'delegation_comfort'
    WHEN question = 'What processes do you have in place to attract, retain, and develop talent?' THEN 'talent_processes'
    WHEN question = 'How committed are you to this venture (full-time, part-time, etc)?' THEN 'venture_commitment'
    WHEN question = 'How much personal capital have you invested in the business?' THEN 'personal_investment'
    WHEN question = 'Are there any other obligations or ventures that could divide your focus?' THEN 'other_obligations'
    WHEN question = 'How long do you see yourself staying actively involved in the business?' THEN 'involvement_duration'
    WHEN question = 'How well do you understand your target market, customer needs, and competitive landscape?' THEN 'market_understanding'
    WHEN question = 'What research or validation have you done to confirm demand for your product or service?' THEN 'demand_validation'
    WHEN question = 'Do you have a roadmap for the next 12 months, 3 years, and 5 years?' THEN 'business_roadmap'
    WHEN question = 'What contingencies have you planned for potential risks or challenges?' THEN 'risk_contingencies'
    WHEN question = 'Can you share an example of a major challenge you''ve faced and how you resolved it' THEN 'challenge_resolution'
    WHEN question = 'How do you make decisions under pressure or with incomplete information?' THEN 'decision_making'
    WHEN question = 'What are the biggest risks to your business, and how do you plan to mitigate them' THEN 'business_risks'
    WHEN question = 'How do you handle setbacks or failures?' THEN 'handling_setbacks'
    WHEN question = 'Are you active in relevant industry communities or events?' THEN 'industry_involvement'
    WHEN question = 'What key partnerships, relationships, or networks have you built to support your business?' THEN 'key_relationships'
    WHEN question = 'How do you approach building relationships with customers, suppliers, and investors?' THEN 'relationship_building'
    WHEN question = 'How would your team describe your management style and personality?' THEN 'management_perception'
    WHEN question = 'How do you handle feedback or criticism?' THEN 'feedback_handling'
    WHEN question = 'What are your leadership strengths, and what areas are you actively working to improve?' THEN 'leadership_development'
    WHEN question = 'How do you maintain your focus and energy while balancing the demands of entrepreneurship?' THEN 'work_life_balance'
    WHEN question = 'What is the current revenue and growth rate?' THEN 'revenue_growth'
    WHEN question = 'What are the gross and net profit margins?' THEN 'profit_margins'
    WHEN question = 'What is the customer acquisition cost (CAC) and lifetime value (LTV)?' THEN 'cac_ltv'
    WHEN question = 'Are the financial projections realistic and based on credible assumptions?' THEN 'financial_projections'
    WHEN question = 'What is the current burn rate, and how much runway is left?' THEN 'burn_rate_runway'
    WHEN question = 'Do you have a capitalization table you''d like to include?' AND input_type = 'textinput' THEN 'cap_table_link'
    WHEN question = 'Do you have a capitalization table you''d like to include?' AND input_type = 'file' THEN 'cap_table_file'
    WHEN question = 'Do you have any cash flow-related documents you''d like to include?' AND input_type = 'textinput' THEN 'cash_flow_link'
    WHEN question = 'Do you have any cash flow-related documents you''d like to include?' AND input_type = 'file' THEN 'cash_flow_file'
    WHEN question = 'Do you have any income statement-related documents you''d like to include?' AND input_type = 'textinput' THEN 'income_statement_link'
    WHEN question = 'Do you have any income statement-related documents you''d like to include?' AND input_type = 'file' THEN 'income_statement_file'
    WHEN question = 'Do you have any balance sheet-related documents you''d like to include?' AND input_type = 'textinput' THEN 'balance_sheet_link'
    WHEN question = 'Do you have any balance sheet-related documents you''d like to include?' AND input_type = 'file' THEN 'balance_sheet_file'
    WHEN question = 'How much funding is the startup seeking, and what will it be used for?' THEN 'funding_request'
    WHEN question = 'What milestones will the funding help achieve?' THEN 'funding_milestones'
    WHEN question = 'Are there other sources of funding (e.g., grants, loans, existing investors)?' THEN 'other_funding'
    WHEN question = 'What is the proposed valuation, and is it justified?' THEN 'valuation_justification'
    WHEN question = 'Do you clearly understand your financial metrics (e.g., revenue, expenses, cash flow)?' THEN 'financial_understanding'
    WHEN question = 'What is your business scaling strategy, and how will you fund growth?' THEN 'scaling_strategy'
    WHEN question = 'How do you prioritize spending and allocate resources?' THEN 'resource_allocation'
    WHEN question = 'What is your exit strategy, and how does it align with investor expectations?' THEN 'investor_exit_alignment'
    WHEN question = 'Do you have any income statement-related documents you’d like to include?' AND input_type = 'file' THEN 'income_statement_documents'
    WHEN question = 'Do you have any income statement-related documents you’d like to include?' AND input_type = 'textinput' THEN 'income_statement_documents_link'
    WHEN question = 'Do you have any balance sheet-related documents you’d like to include?' AND input_type = 'file' THEN 'balance_sheet_documents'
    WHEN question = 'Do you have any balance sheet-related documents you’d like to include?' AND input_type = 'textinput' THEN 'balance_sheet_documents_link'
END;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
UPDATE project_questions SET question_key = NULL;
-- +goose StatementEnd
