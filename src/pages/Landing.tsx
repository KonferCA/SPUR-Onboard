import { useState } from 'react';
import { TextInput, FileUpload, Button, Dropdown } from '@components';
import { PageLayout, Section } from '@components/layout';

// sample industries data
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
        <PageLayout>
            <Section width="narrow" padding="normal">
                <h1 className="text-3xl font-bold mb-8">Landing</h1>
                
                <div className="space-y-8">
                    <TextInput
                        label="Hi"
                        value="Hellooo"
                    />
                    
                    <FileUpload className="w-full" />
                    
                    <Dropdown
                        label="Industry"
                        options={industries}
                        value={selectedIndustry}
                        onChange={(value) => setSelectedIndustry(value as typeof industries[0])}
                    />
                    
                    <div className="flex flex-wrap gap-4">
                        <Button>Click me</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button liquid>Liquid</Button>
                    </div>
                </div>
            </Section>
        </PageLayout>
    );
};

export { Landing };