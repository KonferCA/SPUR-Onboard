import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { AnchorLinkItem, Button } from '@components';
import { getProjectFormQuestions } from '@/services/project';
import { GroupedProjectQuestions, groupProjectQuestions } from '@/config/forms';
import { SectionedLayout } from '@/templates';
import { cva } from 'class-variance-authority';
import { sanitizeHtmlId } from '@/utils/html';
import { QuestionInputs } from '@/components/QuestionInputs/QuestionInputs';
import { useQuery } from '@tanstack/react-query';
import { scrollToTop } from '@/utils';

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
    const { data, isLoading } = useQuery({
        queryKey: ['projectFormQuestions'],
        queryFn: getProjectFormQuestions,
    });
    const [groupedQuestions, setGroupedQuestions] = useState<
        GroupedProjectQuestions[]
    >([]);

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [formData, setFormData] = useState<
        Record<string, Record<string, any>>
    >({});

    const handleChange = (
        questionID: string,
        inputTypeID: string,
        value: any
    ) => {
        // find the question and then the input
        if (formData[questionID]) {
            formData[questionID][inputTypeID] = value;
        } else {
            formData[questionID] = {
                [inputTypeID]: value,
            };
        }
        setFormData({ ...formData });
    };

    const handleSubmit = () => {
        console.log(groupedQuestions);
        console.log(formData);
    };

    const handleNextStep = () => {
        setCurrentStep((curr) => {
            if (curr < groupedQuestions.length - 1) return curr + 1;
            return curr;
        });
        setTimeout(() => {
            scrollToTop();
        }, 120);
    };

    const handleBackStep = () => {
        setCurrentStep((curr) => {
            if (curr > 0) return curr - 1;
            return curr;
        });
        setTimeout(() => {
            scrollToTop();
        }, 120);
    };

    useEffect(() => {
        if (data) {
            setGroupedQuestions(groupProjectQuestions(data));
        }
    }, [data]);

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

    // TODO: make a better loading screen
    if (groupedQuestions.length < 1 || isLoading) return <div>Loading...</div>;

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
                                    <span>{group.section}</span>
                                    {currentStep === idx ? (
                                        <div className="absolute bottom-0 h-[2px] bg-gray-700 w-full"></div>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <form className="space-y-12 lg:max-w-3xl mx-auto mt-12">
                    {groupedQuestions[currentStep].subSections.map(
                        (subSection) => (
                            <div
                                id={sanitizeHtmlId(
                                    `${groupedQuestions[currentStep].section}-${subSection.name}`
                                )}
                                key={`${groupedQuestions[currentStep].section}_${subSection.name}`}
                                className={questionGroupContainerStyles()}
                            >
                                <div>
                                    <h1 className={questionGroupTitleStyles()}>
                                        {subSection.name}
                                    </h1>
                                </div>
                                <div
                                    className={questionGroupTitleSeparatorStyles()}
                                ></div>
                                <div
                                    className={questionGroupQuestionsContainerStyles()}
                                >
                                    {subSection.questions.map((q) => (
                                        <QuestionInputs
                                            key={q.id}
                                            question={q}
                                            values={formData[q.id] ?? {}}
                                            onChange={handleChange}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                    <div className="pb-32 flex gap-8">
                        <Button
                            variant="outline"
                            liquid
                            type="button"
                            disabled={currentStep === 0}
                            onClick={handleBackStep}
                        >
                            Back
                        </Button>
                        <Button
                            liquid
                            type="button"
                            onClick={
                                currentStep < groupedQuestions.length - 1
                                    ? handleNextStep
                                    : handleSubmit
                            }
                        >
                            {currentStep < groupedQuestions.length - 1
                                ? 'Continue'
                                : 'Submit'}
                        </Button>
                    </div>
                </form>
            </div>
        </SectionedLayout>
    );
};

export const Route = createFileRoute('/user/_auth/project/new')({
    component: NewProjectPage,
});
