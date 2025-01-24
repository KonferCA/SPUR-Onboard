import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import {
    AnchorLinkItem,
    Dropdown,
    FileUpload,
    TeamMembers,
    TextArea,
    TextInput,
} from '@components';
import type { FormData, FormField } from '@/types';
import { getProjectFormQuestions } from '@/services/project';
import { groupProjectQuestions, GroupedProjectQuestions } from '@/config/forms';
import { SectionedLayout } from '@/templates';
import { cva } from 'class-variance-authority';
import { sanitizeHtmlId } from '@/utils/html';
import { QuestionInputs } from '@/components/ProjectForm/QuestionInputs';

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

const questionGroupContainerStyles = cva('');
const questionGroupTitleStyles = cva('font-bold align-left text-xl');
const questionGroupTitleSeparatorStyles = cva(
    'my-4 bg-gray-400 w-full h-[2px]'
);
const questionGroupQuestionsContainerStyles = cva('space-y-6');

const NewProjectPage = () => {
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

    const asideLinks = useMemo<AnchorLinkItem[]>(
        () => {
            if (groupedQuestions.length < 1) return [];
            const group = groupedQuestions[currentStep];
            const links: AnchorLinkItem[] = group.subSectionNames.map(
                (name) => ({
                    label: name,
                    target: `#${sanitizeHtmlId(group.section + '-' + name)}`,
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

    if (groupedQuestions.length < 1) return null;

    return (
        <SectionedLayout asideTitle="Submit a project" links={asideLinks}>
            <div>
                <div>
                    <nav>
                        <ul className="flex gap-4 items-center justify-center">
                            {groupedQuestions.map((group, idx) => (
                                <li
                                    key={`step_${group.section}`}
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
                <div className="space-y-12 lg:max-w-3xl mx-auto mt-12">
                    {groupedQuestions[currentStep].subSections.map(
                        (section) => (
                            <div
                                id={sanitizeHtmlId(
                                    `${groupedQuestions[currentStep].section}-${section.name}`
                                )}
                                key={`${groupedQuestions[currentStep].section}_${section.name}`}
                                className={questionGroupContainerStyles()}
                            >
                                <div>
                                    <h1 className={questionGroupTitleStyles()}>
                                        {section.name}
                                    </h1>
                                </div>
                                <div
                                    className={questionGroupTitleSeparatorStyles()}
                                ></div>
                                <div
                                    className={questionGroupQuestionsContainerStyles()}
                                >
                                    {section.questions.map((q) => (
                                        <QuestionInputs
                                            key={q.id}
                                            question={q}
                                            onChange={(k, v) => {
                                                console.log(k, v);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </SectionedLayout>
    );
};

export const Route = createFileRoute('/user/_auth/project/new')({
    component: NewProjectPage,
});
