import { FC, useState } from 'react';
import {
    TextInput,
    DateInput,
    TextArea,
    Button,
    Dropdown,
    ProgressSteps,
} from '@/components';
import {
    CompanyFormProps,
    CompanyInformation,
    COMPANY_STAGES
} from '@/types/company';

export const CompanyForm: FC<CompanyFormProps> = ({
    onSubmit,
    isLoading,
    errors,
    initialData,
}) => {
    const [formData, setFormData] = useState<CompanyInformation>({
        name: initialData?.name || '',
        dateFounded: initialData?.dateFounded || new Date(),
        description: initialData?.description || '',
        stage: initialData?.stage || [],
        website: initialData?.website,
        linkedin: initialData?.linkedin,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (date: Date) => {
        setFormData(prev => ({
            ...prev,
            dateFounded: date
        }));
    };

    const handleStageChange = (selected: any) => {
        setFormData(prev => ({
            ...prev,
            stage: Array.isArray(selected) ? selected : [selected]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <ProgressSteps currentStep={2} />

            <h2 className="text-2xl font-semibold text-center mb-6">
                Complete Your Application
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Company name"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors?.name}
                />

                <DateInput
                    label="Date founded"
                    required
                    value={formData.dateFounded}
                    onChange={handleDateChange}
                    error={errors?.dateFounded}
                    max={new Date()}
                />

                <TextArea
                    label="Description of your company"
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors?.description}
                    rows={4}
                    placeholder="Tell us about your company..."
                />

                <Dropdown
                    label="Company stage"
                    required
                    value={formData.stage}
                    options={COMPANY_STAGES}
                    multiple
                    onChange={handleStageChange}
                    error={errors?.stage}
                    placeholder="Select one or more stages"
                />

                <TextInput
                    label="Your company's website URL"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    error={errors?.website}
                    placeholder="https://example.com"
                />

                <TextInput
                    label="Your company's LinkedIn URL"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleChange}
                    error={errors?.linkedin}
                    placeholder="https://linkedin.com/company/your-company"
                    required
                />

                <div className="pt-4">
                    <Button
                        type="submit"
                        liquid
                        size="lg"
                        variant="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving company...' : 'Register Company'}
                    </Button>
                </div>
            </form>
        </div>
    );
};