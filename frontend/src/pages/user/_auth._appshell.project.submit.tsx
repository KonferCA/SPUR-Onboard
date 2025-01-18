import { createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
    TextInput,
    Dropdown,
    FileUpload,
    TeamMembers,
    SocialLinks,
    TextArea,
    DateInput,
} from '@components';
import { Section } from '@layouts';
import type { FormField, FormData } from '@/types';
// import { projectFormSchema } from '@/config/forms';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectFormQuestions } from '@/services/project';
import { groupProjectQuestions } from '@/config/forms';

const SubmitProjectPage = () => {
    const [currentStep, setCurrentStep] = useState<string>('A');
    const [formData, setFormData] = useState<FormData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { companyId } = useAuth();

    const handleNext = () => {
        setCurrentStep('B');
    };

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

            navigate({ to: '/user/dashboard' });
        } catch (err) {
            console.error('Failed to submit project:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to submit project'
            );
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
                        onChange={(e) => handleChange(field.id, e.target.value)}
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
                        onChange={(e) => handleChange(field.id, e.target.value)}
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
            case 'team':
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

    useEffect(() => {
        const f = async () => {
            try {
                const data = await getProjectFormQuestions();
                const grouped = groupProjectQuestions(data);
                console.log(grouped);
            } catch (error) {
                console.error(error);
            }
        };
        f();
    }, []);

    return (
        <>
            <div className="max-w-2xl mx-auto">
                <Section>
                    <div className="space-y-8">
                        {/* Header with tabs */}
                        <div>
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-semibold">
                                    Submit a project
                                </h1>
                            </div>
                            <div className="mt-2">
                                <div className="flex gap-4 border-b border-gray-200">
                                    {[].map(
                                        (step: {
                                            id: string;
                                            title: string;
                                        }) => (
                                            <div
                                                key={step.id}
                                                className={`pb-2 px-4 cursor-pointer ${
                                                    currentStep === step.id
                                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                                        : 'text-gray-500'
                                                }`}
                                                onClick={() =>
                                                    setCurrentStep(step.id)
                                                }
                                            >
                                                {step.title}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form sections */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            ></motion.div>
                        </AnimatePresence>

                        {/* Error message */}
                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-8">
                            {currentStep === 'A' ? (
                                <div />
                            ) : (
                                <button
                                    onClick={() => setCurrentStep('A')}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Back
                                </button>
                            )}
                            {currentStep === 'A' ? (
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </div>
                </Section>
            </div>
        </>
    );
};

export const Route = createFileRoute('/user/_auth/_appshell/project/submit')({
    component: SubmitProjectPage,
});
