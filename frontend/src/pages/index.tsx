import { useState } from 'react';
import {
    TextInput,
    FileUpload,
    Button,
    Dropdown,
    AnchorLinkItem,
} from '@components';
import { SectionedLayout, Section } from '@layouts';
import { createFileRoute } from '@tanstack/react-router';

// sample industries data
const industries = [
    { id: 1, label: 'Technology', value: 'tech' },
    { id: 2, label: 'Healthcare', value: 'healthcare' },
    { id: 3, label: 'Finance', value: 'finance' },
    { id: 4, label: 'Education', value: 'education' },
    { id: 5, label: 'Manufacturing', value: 'manufacturing' },
    { id: 6, label: 'Retail', value: 'retail' },
];

const links: AnchorLinkItem[] = [
    {
        label: 'dropdown',
        target: '#dropdown',
    },
    {
        label: 'buttons',
        target: '#buttons',
    },
];

const Landing: React.FC = () => {
    const [selectedIndustry, setSelectedIndustry] = useState<
        (typeof industries)[0] | null
    >(null);

    return (
        <SectionedLayout asideTitle="Landing Page" links={links}>
            <Section width="narrow" padding="normal">
                <h1 className="text-3xl font-bold mb-8">Landing</h1>

                <div className="space-y-8">
                    <TextInput label="Hi" value="Hellooo" />

                    <FileUpload className="w-full" />

                    <div id="dropdown">
                        <Dropdown
                            label="Industry"
                            options={industries}
                            value={selectedIndustry}
                            onChange={(value) =>
                                setSelectedIndustry(
                                    value as (typeof industries)[0]
                                )
                            }
                        />
                    </div>

                    <div className="h-[1500px]"></div>

                    <div id="buttons" className="flex flex-wrap gap-4">
                        <Button>Click me</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button liquid>Liquid</Button>
                    </div>
                </div>
            </Section>
        </SectionedLayout>
    );
};

export const Route = createFileRoute('/')({
    component: Landing,
});
