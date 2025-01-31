import { FC, useState } from 'react';
import {
    TextInput,
    DateInput,
    TextArea,
    Button,
    Dropdown,
    DropdownOption,
} from '@/components';

export interface CompanyInformation {
    name: string;
    dateFounded: Date;
    description: string;
    stage: DropdownOption[];
    website?: string;
    linkedin?: string;
}

export interface CompanyFormProps {
    onSubmit: (data: CompanyInformation) => Promise<void>;
    isLoading: boolean;
    initialData?: Partial<CompanyInformation>;
}

export const CompanyForm: FC<CompanyFormProps> = ({
    onSubmit,
    isLoading,
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-6">
                Complete Your Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput
                    label="Company name"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <DateInput
                    label="Date founded"
                    required
                    onChange={console.log}
                />

                <TextArea
                    label="Description of your company"
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />

                {/* TODO: This dropdown has to be multiple, instead of single */}
                <Dropdown
                    label="Company stage"
                    required
                    value={formData.stage}
                    options={[
                        'Ideation',
                        'MVP',
                        'Investment',
                        'Product-market Fit',
                        'Go-to-market',
                        'Growth',
                        'Maturity',
                    ].map((opt) => ({
                        id: opt,
                        label: opt,
                        value: opt,
                    }))}
                    multiple
                    onChange={console.log}
                />

                <TextInput
                    label="Your company's website URL"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
                />

                <TextInput
                    label="Your company's LinkedIn URL"
                    name="linkedin"
                    value={formData.linkedin || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
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
