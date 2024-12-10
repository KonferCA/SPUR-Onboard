import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    UserDashboard,
    TextInput,
    Dropdown,
    Section,
    FileUpload,
    AnchorLinks,
    TeamMembers,
    SocialLinks,
    TextArea,
    DateInput,
} from '@components';
import type { FormField, FormData } from '@/types';
import { projectFormSchema } from '@/config/forms';
import { createProject } from '@/services';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SubmitProjectPage = () => {
    const [currentStep, setCurrentStep] = useState<'A' | 'B'>('A');
    const [formData, setFormData] = useState<FormData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { companyId } = useAuth();

    const fillWithSampleData = () => {
        const sampleData = {
            // Bookkeeping
            companyName: 'TechVision AI Solutions',
            foundedDate: '2023-06-15',
            companyStage: 'seed',
            investmentStage: 'seed',

            // Company Overview
            description:
                'TechVision AI Solutions is a cutting-edge artificial intelligence company focused on developing innovative computer vision solutions for retail and manufacturing industries. Our proprietary AI algorithms help businesses automate quality control, optimize inventory management, and enhance customer experiences.',
            inspiration:
                'After working in manufacturing for over a decade, we witnessed firsthand the inefficiencies and errors in manual quality control processes. This inspired us to develop an AI-powered solution that could perform inspections with greater accuracy and consistency, while significantly reducing costs and improving production speed.',
            vision: 'Our vision is to become the global leader in AI-powered visual inspection and analytics. We aim to revolutionize how businesses handle quality control and inventory management by making advanced computer vision technology accessible and affordable for companies of all sizes. Within 5 years, we plan to expand our solutions across multiple industries and establish ourselves as the industry standard for automated visual inspection.',

            // Team Members
            'team-members': [
                {
                    id: '1',
                    name: 'Sarah Chen',
                    role: 'CEO & Co-founder',
                    avatar: '',
                },
                {
                    id: '2',
                    name: 'Michael Rodriguez',
                    role: 'CTO & Co-founder',
                    avatar: '',
                },
                {
                    id: '3',
                    name: 'Dr. Emily Thompson',
                    role: 'Head of AI Research',
                    avatar: '',
                },
            ],

            // Social Links
            'social-links': [
                {
                    id: '1',
                    type: 'website',
                    url: 'https://techvision-ai.com',
                },
                {
                    id: '2',
                    type: 'linkedin',
                    url: 'https://linkedin.com/company/techvision-ai',
                },
                {
                    id: '3',
                    type: 'twitter',
                    url: 'https://twitter.com/techvision_ai',
                },
            ],
        };

        setFormData(sampleData);
    };

    const handleNext = () => {
        setCurrentStep('B');
    };

    // const handleBack = () => {
    //   setCurrentStep('A');
    // };

    const handleChange = (fieldId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!companyId) {
            setError('Company ID not found. Please create a company first.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Get files and links from form data
            const files = formData.documents || [];
            const links =
                formData['social-links']?.map(
                    (link: { type: string; url: string }) => ({
                        type: link.type || 'website',
                        url: link.url,
                    })
                ) || [];

            // Create project with files and links in one call
            const project = await createProject(
                companyId,
                formData,
                files,
                links
            );
            console.log('Created project:', project);

            // Navigate to success page or dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to submit project:', err);
            setError('Failed to submit project. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        switch (field.type) {
            case 'text':
                return (
                    <TextInput
                        label={field.label}
                        value={formData[field.id] || ''}
                        onChange={(value) => handleChange(field.id, value)}
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                );
            case 'date':
                return (
                    <DateInput
                        label={field.label}
                        value={formData[field.id] || ''}
                        onChange={(value) => handleChange(field.id, value)}
                        required={field.required}
                    />
                );
            case 'textarea':
                return (
                    <TextArea
                        label={field.label}
                        value={formData[field.id] || ''}
                        onChange={(value) => handleChange(field.id, value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={field.rows}
                    />
                );
            case 'dropdown':
                return (
                    <Dropdown
                        label={field.label}
                        options={field.options || []}
                        value={
                            field.options?.find(
                                (opt) => opt.value === formData[field.id]
                            ) || null
                        }
                        onChange={(option) =>
                            handleChange(field.id, option.value)
                        }
                        placeholder={`Select ${field.label.toLowerCase()}`}
                    />
                );
            case 'file':
                return (
                    <FileUpload
                        onFilesChange={(files) => handleChange(field.id, files)}
                    />
                );
            case 'team-members':
                return (
                    <TeamMembers
                        value={formData[field.id] || []}
                        onChange={(members) => handleChange(field.id, members)}
                    />
                );
            case 'social-links':
                return (
                    <SocialLinks
                        value={formData[field.id] || []}
                        onChange={(links) => handleChange(field.id, links)}
                    />
                );
            default:
                return null;
        }
    };

    const currentStepData = projectFormSchema.find(
        (step) => step.id === currentStep
    );

    const renderAnchorLinks = () => {
        const links =
            currentStepData?.sections.map((section) => ({
                label: section.title,
                target: `#${section.id}`,
            })) || [];

        return (
            <div className="w-64 bg-white border-r border-gray-200">
                <nav className="sticky top-0 py-4">
                    <AnchorLinks links={links}>
                        {(link) => (
                            <span
                                className={
                                    'block px-6 py-2 text-sm transition hover:text-gray-800 ' +
                                    (link.active
                                        ? 'text-black font-medium'
                                        : 'text-gray-400')
                                }
                            >
                                {link.label}
                            </span>
                        )}
                    </AnchorLinks>
                </nav>
            </div>
        );
    };

    return (
        <UserDashboard customSidebar={renderAnchorLinks()}>
            <div className="max-w-2xl mx-auto">
                <Section>
                    <div className="space-y-8">
                        {/* Header with tabs */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-semibold">
                                    Submit a project
                                </h1>
                                <div className="flex gap-4">
                                    <button
                                        onClick={fillWithSampleData}
                                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        Fill with Sample Data
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="flex gap-4 border-b border-gray-200">
                                    {projectFormSchema.map((step) => (
                                        <div
                                            key={step.id}
                                            className={`pb-2 px-4 cursor-pointer ${
                                                currentStep === step.id
                                                    ? 'border-b-2 border-gray-900'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                setCurrentStep(step.id)
                                            }
                                        >
                                            <span
                                                className={`text-sm font-medium ${
                                                    currentStep === step.id
                                                        ? 'text-gray-900'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {step.title}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                {step.subtitle}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {error && (
                                    <div className="text-red-500 text-sm mb-4">
                                        {error}
                                    </div>
                                )}

                                {currentStepData?.sections.map((section) => (
                                    <div
                                        key={section.id}
                                        id={section.id}
                                        className="mb-8"
                                    >
                                        <h3 className="text-lg font-medium mb-2">
                                            {section.title}
                                        </h3>
                                        {section.description && (
                                            <p className="text-gray-600 text-sm mb-4">
                                                {section.description}
                                            </p>
                                        )}
                                        <div className="space-y-4">
                                            {section.fields.map((field) => (
                                                <div key={field.id}>
                                                    {renderField(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {currentStep === 'A' && (
                                    <div className="pt-6">
                                        <button
                                            className="w-full py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                            onClick={handleNext}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                )}

                                {currentStep === 'B' && (
                                    <div className="pt-6">
                                        <button
                                            className="w-full py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                                            onClick={handleSubmit}
                                            disabled={
                                                isSubmitting || !companyId
                                            }
                                        >
                                            {isSubmitting
                                                ? 'Submitting...'
                                                : 'Submit Application'}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Section>
            </div>
        </UserDashboard>
    );
};

export { SubmitProjectPage };
