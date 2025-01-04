import { useState } from 'react';
import {
    TextInput,
    FileUpload,
    Button,
    Dropdown,
    AnchorLinks,
} from '@components';
import { PageLayout, Section } from '@layouts';
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

const Landing: React.FC = () => {
    const [selectedIndustry, setSelectedIndustry] = useState<
        (typeof industries)[0] | null
    >(null);

    return (
        <PageLayout>
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

                <div className="fixed top-2 left-10">
                    <AnchorLinks
                        onClick={(l, e) => {
                            console.log(l, e);
                        }}
                        links={[
                            {
                                label: 'dropdown',
                                target: '#dropdown',
                            },
                            {
                                label: 'buttons',
                                target: '#buttons',
                            },
                        ]}
                    >
                        {(link) => (
                            <span
                                className={
                                    'transition hover:text-gray-800 ' +
                                    (link.active
                                        ? 'text-black'
                                        : 'text-gray-400')
                                }
                            >
                                {link.label}
                            </span>
                        )}
                    </AnchorLinks>
                </div>
            </Section>
        </PageLayout>
    );
};

export const Route = createFileRoute('/')({
    component: Landing,
});
