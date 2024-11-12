import { useState } from 'react';
import { FileUpload, Dropdown } from '@components';

// sample industries data lol
const industries = [
    { id: 1, label: 'Technology', value: 'tech' },
    { id: 2, label: 'Healthcare', value: 'healthcare' },
    { id: 3, label: 'Finance', value: 'finance' },
    { id: 4, label: 'Education', value: 'education' },
    { id: 5, label: 'Manufacturing', value: 'manufacturing' },
    { id: 6, label: 'Retail', value: 'retail' },
];

const Landing: React.FC = () => {
    const [selectedIndustry, setSelectedIndustry] = useState<typeof industries[0] | null>(null);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div>
                <Dropdown
                    label="Industry"
                    options={industries}
                    value={selectedIndustry}
                    onChange={(value) => setSelectedIndustry(value as typeof industries[0])}
                />
            </div>
        </div>
    );
};

export { Landing };