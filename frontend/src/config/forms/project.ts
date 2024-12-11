import type { FormStep } from '@/types';

export const projectFormSchema: FormStep[] = [
    {
        id: 'A',
        title: 'Project Information',
        subtitle: 'Tell us about your project',
        sections: [
            {
                id: 'bookkeeping',
                title: 'Bookkeeping',
                fields: [
                    {
                        id: 'companyName',
                        type: 'text',
                        label: 'What is the name of your company?',
                        required: true,
                    },
                    {
                        id: 'foundedDate',
                        type: 'date',
                        label: 'When was your company founded?',
                    },
                    {
                        id: 'companyStage',
                        type: 'dropdown',
                        label: 'What stage is your company at?',
                        options: [
                            { id: 1, label: 'Pre-seed', value: 'pre-seed' },
                            { id: 2, label: 'Seed', value: 'seed' },
                            { id: 3, label: 'Series A', value: 'series-a' },
                            { id: 4, label: 'Series B', value: 'series-b' },
                            {
                                id: 5,
                                label: 'Series C+',
                                value: 'series-c-plus',
                            },
                        ],
                    },
                    {
                        id: 'investmentStage',
                        type: 'dropdown',
                        label: 'What investment stage is your company at?',
                        options: [
                            { id: 1, label: 'Pre-seed', value: 'pre-seed' },
                            { id: 2, label: 'Seed', value: 'seed' },
                            { id: 3, label: 'Series A', value: 'series-a' },
                            { id: 4, label: 'Series B', value: 'series-b' },
                            {
                                id: 5,
                                label: 'Series C+',
                                value: 'series-c-plus',
                            },
                        ],
                    },
                ],
            },
            {
                id: 'company-overview',
                title: 'Company Overview',
                description:
                    'Please do not go into detail about your product in this section, you will have a chance to do so in the following sections of the form.',
                fields: [
                    {
                        id: 'description',
                        type: 'textarea',
                        label: 'Brief description of your company',
                        required: true,
                        rows: 4,
                    },
                    {
                        id: 'inspiration',
                        type: 'textarea',
                        label: "What inspired you to start this company, and what is the core problem you're solving?",
                        required: true,
                        rows: 4,
                    },
                    {
                        id: 'vision',
                        type: 'textarea',
                        label: 'What is your long-term vision for the company, and how do you plan to disrupt or lead your market?',
                        required: true,
                        rows: 4,
                    },
                ],
            },
            {
                id: 'product-overview',
                title: 'Product Overview',
                description: '',
                fields: [
                    {
                        id: 'product-description',
                        type: 'textarea',
                        label: 'How does your product or idea differentiate from competitors, and what makes it defensible or unique?',
                        required: true,
                    },
                    {
                        id: 'product-roadmap',
                        type: 'textarea',
                        label: 'What does your current product roadmap look like?',
                        required: true,
                    },
                ],
            },
            {
                id: 'customer-demographic',
                title: 'Customer & Demographic',
                description: '',
                fields: [
                    {
                        id: 'target-demographic',
                        type: 'textarea',
                        label: 'Who are your target demographic and customers? What makes your product or service compelling to them?',
                        required: true,
                    },
                    {
                        id: 'addressable-market',
                        type: 'textarea',
                        label: 'What is the total addressable market for this company? How do you plan to capture your share of it?',
                        required: true,
                    },
                ],
            },
            {
                id: 'financials',
                title: 'Financials',
                description: '',
                fields: [
                    {
                        id: 'company-revenue',
                        type: 'text',
                        label: "What is your company's annual recurring revenue (ARR)?",
                        required: true,
                    },
                    {
                        id: 'company-raised',
                        type: 'text',
                        label: 'How much has your company raised so far?',
                        required: true,
                    },
                    {
                        id: 'company-valuation',
                        type: 'text',
                        label: "What is your company's current valuation?",
                        required: true,
                    },
                    {
                        id: 'company-monthly-expenses',
                        type: 'text',
                        label: "What are your company's monthly expenses?",
                        required: true,
                    },
                    {
                        id: 'company-main-revenue',
                        type: 'textarea',
                        label: 'What are your main revenue streams, and how do you project these will grow over the next 12-36 months?',
                        required: true,
                    },
                    {
                        id: 'company-funding',
                        type: 'textarea',
                        label: 'What funding have you raised so far, and how have you allocated that capital towards growth and development?',
                        required: true,
                    },
                ],
            },
            {
                id: 'team-overview',
                title: 'Team Overview',
                description: 'Tell us about your team members',
                fields: [
                    {
                        id: 'team-members',
                        type: 'team-members',
                        label: 'Team Members',
                        required: true,
                    },
                ],
            },
            {
                id: 'social-media',
                title: 'Social Media & Web Presence',
                description:
                    "Please share with us your online presence so we can get a better understanding of your organization's identity. You can share pages like your website, LinkedIn, Instagram etc...",
                fields: [
                    {
                        id: 'social-links',
                        type: 'social-links',
                        label: 'Social Links',
                        required: true,
                    },
                ],
            },
        ],
    },
    {
        id: 'B',
        title: 'Part B',
        subtitle: 'Document uploads',
        sections: [
            {
                id: 'document-upload',
                title: 'Upload company business documents',
                description:
                    "To help us verify your organization's legitimacy, please provide us with business related documents.",
                fields: [
                    {
                        id: 'documents',
                        type: 'file',
                        label: 'Upload your documents',
                    },
                ],
            },
        ],
    },
];
