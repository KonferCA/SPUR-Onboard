import { createFileRoute } from '@tanstack/react-router';
import {
    TextInput,
    TeamMembers,
    FileUpload,
    // SocialLinks,
    TextArea,
    DateInput,
    Dropdown,
} from '@/components';
import { Section } from '@layouts';
import { useAuth } from '@/contexts/AuthContext';
import { createCompany } from '@/services';
import { FormField, FormData, FormSection } from '@/types';
import { FC, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

const companyForm: FormSection[] = [
    {
        id: 'bookkeeping',
        title: 'Bookkeeping',
        fields: [
            {
                key: 'companyName',
                type: 'textinput',
                label: 'What is the name of your company?',
                required: true,
            },
            {
                key: 'foundedDate',
                type: 'date',
                label: 'When was your company founded?',
            },
            {
                key: 'companyStage',
                type: 'select',
                label: 'What stage is your company at?',
                options: [
                    { id: 1, label: 'Pre-seed', value: 'pre-seed' },
                    { id: 2, label: 'Seed', value: 'seed' },
                    { id: 3, label: 'Series A', value: 'series-a' },
                    { id: 4, label: 'Series B', value: 'series-b' },
                    { id: 5, label: 'Series C+', value: 'series-c-plus' },
                ],
            },
            {
                key: 'investmentStage',
                type: 'select',
                label: 'What investment stage is your company at?',
                options: [
                    { id: 1, label: 'Pre-seed', value: 'pre-seed' },
                    { id: 2, label: 'Seed', value: 'seed' },
                    { id: 3, label: 'Series A', value: 'series-a' },
                    { id: 4, label: 'Series B', value: 'series-b' },
                    { id: 5, label: 'Series C+', value: 'series-c-plus' },
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
                key: 'description',
                type: 'textarea',
                label: 'Brief description of your company',
                required: true,
                rows: 4,
            },
            {
                key: 'inspiration',
                type: 'textarea',
                label: "What inspired you to start this company, and what is the core problem you're solving?",
                required: true,
                rows: 4,
            },
            {
                key: 'vision',
                type: 'textarea',
                label: 'What is your long-term vision for the company, and how do you plan to disrupt or lead your market?',
                required: true,
                rows: 4,
            },
        ],
    },
];

const CreateCompany: FC = () => {
    const [formData, setFormData] = useState<FormData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, setCompanyId } = useAuth();
    const navigate = useNavigate();

    const handleChange = (fieldId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!formData['companyName'] || !formData['description'] || !user) {
            return;
        }

        try {
            setIsSubmitting(true);
            const company = await createCompany(
                user.id,
                formData['companyName'],
                formData['description']
            );
            setCompanyId(company.ID);
            navigate({ to: '/user/dashboard' });
        } catch (err) {
            console.error('failed to create company:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        switch (field.type) {
            case 'textinput':
                return (
                    <TextInput
                        label={field.label}
                        value={formData[field.key] || ''}
                        onChange={(e) =>
                            handleChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                );
            case 'date':
                return (
                    <DateInput
                        label={field.label}
                        value={formData[field.key] || ''}
                        onChange={(value) => handleChange(field.key, value)}
                        required={field.required}
                    />
                );
            case 'textarea':
                return (
                    <TextArea
                        label={field.label}
                        value={formData[field.key] || ''}
                        onChange={(e) =>
                            handleChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={field.rows}
                    />
                );
            case 'select':
                return (
                    <Dropdown
                        label={field.label}
                        options={field.options || []}
                        value={
                            field.options?.find(
                                (opt) => opt.value === formData[field.key]
                            ) || null
                        }
                        onChange={(option) =>
                            handleChange(field.key, option.value)
                        }
                        placeholder={`Select ${field.label.toLowerCase()}`}
                    />
                );
            case 'file':
                return (
                    <FileUpload
                        onFilesChange={(files) =>
                            handleChange(field.key, files)
                        }
                    />
                );
            case 'team':
                return (
                    <TeamMembers
                        value={formData[field.key] || []}
                        onChange={(members) => handleChange(field.key, members)}
                    />
                );
            // case 'social-links':
            //     return (
            //         <SocialLinks
            //             value={formData[field.key] || []}
            //             onChange={(links) => handleChange(field.key, links)}
            //         />
            //     );
            default:
                return null;
        }
    };
    return (
        <>
            <div className="max-w-2xl mx-auto">
                <Section>
                    {companyForm.map((section) => (
                        <div id={section.id} key={section.id} className="mb-8">
                            <h3 className="textinput-lg font-medium mb-2">
                                {section.title}
                            </h3>
                            {section.description && (
                                <p className="textinput-gray-600 textinput-sm mb-4">
                                    {section.description}
                                </p>
                            )}
                            <div className="space-y-4">
                                {section.fields.map((field) => (
                                    <div key={field.key}>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="pt-6">
                        <button
                            className="w-full py-3 bg-gray-600 textinput-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Company'}
                        </button>
                    </div>
                </Section>
            </div>
        </>
    );
};

export const Route = createFileRoute('/user/_auth/_appshell/company/new')({
    component: CreateCompany,
});
