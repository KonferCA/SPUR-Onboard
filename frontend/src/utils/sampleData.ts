interface SampleDataConfig {
    value: any;
    type: 'text' | 'date' | 'select' | 'multiselect';
}

const sampleAnswers: Record<string, SampleDataConfig> = {
    // Company Basics
    'What is the name of your company?': {
        value: 'TechVision Solutions',
        type: 'text',
    },
    'When was your company founded?': {
        value: new Date('2024-01-15'),
        type: 'date',
    },
    'Company website': {
        value: 'https://techvision-solutions.com',
        type: 'text',
    },
    'What stage is your company at?': {
        value: ['Series A'],
        type: 'select',
    },

    // URLs and Social Media
    'Please upload a pitch deck.': {
        value: 'https://pitch.techvision-solutions.com/deck2024',
        type: 'text',
    },
    "Do you have any market research-related documents you'd like to inlcude?":
        {
            value: 'https://docs.techvision-solutions.com',
            type: 'text',
        },
    "Do you have any customer data-related documents you'd like to include?": {
        value: 'https://docs.techvision-solutions.com',
        type: 'text',
    },
    'Are there any IP-related files you would like to upload, such as patents or trademarks?':
        {
            value: 'https://docs.techvision-solutions.com',
            type: 'text',
        },
    "Do you have any contracts, agreements, or letters of intent you'd like to include?":
        {
            value: 'https://docs.techvision-solutions.com',
            type: 'text',
        },
    "Do you have a capitalization table you'd like to include?": {
        value: 'https://docs.techvision-solutions.com',
        type: 'text',
    },
    "Do you have any cash flow-related documents you'd like to include?": {
        value: 'https://docs.techvision-solutions.com',
        type: 'text',
    },
    "Do you have any income statement-related documents you'd like to include?":
        {
            value: 'https://docs.techvision-solutions.com',
            type: 'text',
        },
    "What is the company's business plan?": {
        value: 'https://docs.techvision-solutions.com',
        type: 'text',
    },
    'Do you have any balance sheet-related documents you’d like to include?': {
        value: 'https://docs.techvision-solutions.com',
        type: 'text',
    },
    'Include a link to a 5-minute video of you or your company pitching itself.':
        {
            value: 'https://docs.techvision-solutions.com',
            type: 'text',
        },

    // Sectors and Markets
    'Which sectors does your company operate in?': {
        value: [
            'Software & Technology',
            'Data Analytics',
            'Enterprise Software',
        ],
        type: 'multiselect',
    },
    'What is your target market?': {
        value: ['B2B', 'Enterprise'],
        type: 'multiselect',
    },

    // Product/Service Details
    'What is the core product or service, and what problem does it solve?': {
        value: 'Our AI-powered analytics platform helps businesses make data-driven decisions by automatically processing and visualizing complex datasets. It solves the challenge of time-consuming manual data analysis and reduces human error.',
        type: 'text',
    },
    'What is the unique value proposition?': {
        value: 'We combine advanced AI algorithms with an intuitive user interface, making enterprise-level analytics accessible to companies of all sizes. Our platform reduces analysis time by 80% while increasing accuracy by 95%.',
        type: 'text',
    },
    'What stage of development is the product in (idea, prototype, MVP, production)?':
        {
            value: 'Production',
            type: 'select',
        },
    'How scalable is the product/service?': {
        value: 'Our cloud-based platform is built on microservices architecture using AWS, allowing us to scale instantly with demand. We can handle millions of data points with minimal additional infrastructure cost.',
        type: 'text',
    },

    // Market & Customers
    'Who are the target customers, and what are their needs?': {
        value: 'Our primary targets are mid-sized businesses in the retail and finance sectors who need to process large amounts of data but lack dedicated data science teams. They need affordable, user-friendly analytics solutions that provide actionable insights.',
        type: 'text',
    },
    'How well do you understand your target market, customer needs, and competitive landscape?':
        {
            value: "Through extensive market research and 100+ customer interviews, we've developed a deep understanding of the analytics needs in our target sectors. Our team has identified key pain points in existing solutions and validated our approach with industry experts.",
            type: 'text',
        },
    'What research or validation have you done to confirm demand for your product or service?':
        {
            value: "We've conducted beta testing with 25 companies, achieving a 92% retention rate. Our waitlist has grown to 500+ companies through word-of-mouth alone, and we've received letters of intent from 3 enterprise customers.",
            type: 'text',
        },

    // Team & Commitment
    'How long do you see yourself staying actively involved in the business?': {
        value: "I am fully committed to leading this venture for the next 7-10 years minimum. This is my life's work, and I'm dedicated to building a lasting company that transforms how businesses handle data analytics.",
        type: 'text',
    },
    'What inspired you to start this company?': {
        value: 'During my 10 years in data science consulting, I consistently saw companies struggle with making their data actionable. This firsthand experience inspired me to create a solution that democratizes access to advanced analytics.',
        type: 'text',
    },

    // Financial & Business Model
    'What is the current revenue and growth rate?': {
        value: '$2.5M ARR with 150% YoY growth',
        type: 'text',
    },
    'What are the gross and net profit margins?': {
        value: 'Gross margin: 75%, Net margin: 15%',
        type: 'text',
    },
    'What is your business model?': {
        value: 'We operate on a SaaS model with tiered pricing based on data volume and feature access. Enterprise customers receive custom integrations and dedicated support. Current pricing ranges from $499 to $2499 per month, with enterprise plans starting at $10,000 monthly.',
        type: 'text',
    },

    // Vision & Strategy
    "What is the company's mission?": {
        value: 'To democratize data analytics and empower businesses worldwide to make smarter decisions through accessible AI technology.',
        type: 'text',
    },
    'What is your long-term vision for the company?': {
        value: 'We aim to become the industry standard for business intelligence by 2027, serving over 10,000 companies globally. Our vision includes expanding into predictive analytics and automated decision-making systems.',
        type: 'text',
    },

    // Competition & Market Position
    'Who are your main competitors?': {
        value: 'Our main competitors include traditional BI tools like Tableau and PowerBI, as well as newer players like Looker. However, our AI-first approach and focus on automation differentiates us significantly.',
        type: 'text',
    },
    'What is your competitive advantage?': {
        value: "Our proprietary AI algorithms provide 3x faster insights than traditional tools, while our intuitive interface requires 70% less training time. We're the only solution offering automated anomaly detection and predictive analytics at this price point.",
        type: 'text',
    },

    // Growth & Expansion
    'What are your growth plans?': {
        value: "We plan to expand into European markets in Q3 2024, followed by Asia-Pacific in 2025. Product-wise, we're launching our predictive analytics module in Q4 2024 and exploring strategic partnerships with major cloud providers.",
        type: 'text',
    },
    'How do you plan to scale the business?': {
        value: 'Our growth strategy focuses on three pillars: 1) Expanding our self-serve customer base through digital marketing, 2) Building an enterprise sales team for larger accounts, and 3) Developing strategic partnerships with consulting firms.',
        type: 'text',
    },
};

export const getSampleAnswer = (question: string, inputType: string): any => {
    const config = sampleAnswers[question] || {
        value: `Sample answer for: ${question}. This is a detailed response that demonstrates understanding and expertise in this area.`,
        type: 'text',
    };

    // Special handling for URL fields if not found in sampleAnswers
    if (!sampleAnswers[question] && question.toLowerCase().includes('url')) {
        return 'https://example.com/sample-resource';
    }

    // Handle different input types
    switch (inputType) {
        case 'date':
            return config.value;
        case 'select':
        case 'multiselect':
            return [];
        default:
            return typeof config.value === 'string'
                ? config.value
                : config.value[0];
    }
};
