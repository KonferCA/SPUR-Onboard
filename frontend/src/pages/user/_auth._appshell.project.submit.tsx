import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import {
    TextInput,
    Dropdown,
    FileUpload,
    TeamMembers,
    SocialLinks,
    TextArea,
    DateInput,
    AnchorLinkItem,
} from '@components';
import type { FormField, FormData } from '@/types';
import { getProjectFormQuestions } from '@/services/project';
import { groupProjectQuestions, GroupedProjectQuestions } from '@/config/forms';
import { SectionedLayout } from '@/templates';
import { cva } from 'class-variance-authority';

const stepItemStyles = cva(
    'relative transition text-gray-400 hover:text-gray-600 hover:cursor-pointer py-2',
    {
        variants: {
            active: {
                true: ['text-gray-700 hover:text-gray-700'],
            },
        },
    }
);

const SubmitProjectPage = () => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [groupedQuestions, setSections] = useState<GroupedProjectQuestions[]>(
        []
    );
    const [formData, setFormData] = useState<FormData>({});

    const handleChange = (fieldId: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
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

    const asideLinks = useMemo<AnchorLinkItem[]>(
        () => {
            if (groupedQuestions.length < 1) return [];
            const group = groupedQuestions[currentStep];
            const links: AnchorLinkItem[] = group.subSectionNames.map(
                (name) => ({
                    label: name,
                    target: `#${group.section}_${name}`,
                })
            );
            return links;
        },
        // re-compute the aside links when the current step is changed
        // or new sections/questions are fetched
        [currentStep, groupedQuestions]
    );

    useEffect(() => {
        const f = async () => {
            try {
                const data = await getProjectFormQuestions();
                const grouped = groupProjectQuestions(data);
                setSections(grouped);
            } catch (error) {
                console.error(error);
            }
        };
        f();
    }, []);

    return (
        <SectionedLayout asideTitle="Submit a project" links={asideLinks}>
            <div>
                <div>
                    <nav>
                        <ul className="flex gap-4 items-center justify-center">
                            {groupedQuestions.map((group, idx) => (
                                <li
                                    key={group.section}
                                    className={stepItemStyles({
                                        active: currentStep === idx,
                                    })}
                                    onClick={() => {
                                        setCurrentStep(idx);
                                    }}
                                >
                                    <span className="mr-2">{idx + 1}</span>
                                    <span>{group.section}</span>
                                    {currentStep === idx ? (
                                        <div className="absolute bottom-0 h-[2px] bg-gray-700 w-full"></div>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div></div>
            </div>
        </SectionedLayout>
    );
};

export const Route = createFileRoute('/user/_auth/_appshell/project/submit')({
    component: SubmitProjectPage,
});
