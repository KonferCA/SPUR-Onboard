import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@components';
import {
    createProject,
    getProjectFormQuestions,
    ProjectDraft,
    saveProjectDraft,
} from '@/services/project';
import { GroupedProjectQuestions, groupProjectQuestions } from '@/config/forms';
import { SectionedLayout } from '@/templates';
import { cva } from 'class-variance-authority';
import { sanitizeHtmlId } from '@/utils/html';
import { QuestionInputs } from '@/components/QuestionInputs/QuestionInputs';
import { useQuery } from '@tanstack/react-query';
import { scrollToTop } from '@/utils';
import { useDebounceFn } from '@/hooks';

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
    const [currentProjectId, setCurrentProjectId] = useState(
        'd9b03b86-a8a1-4861-b299-4a6f8de001aa'
    );
    const { data: questionData, isLoading: loadingQuestions } = useQuery({
        //@ts-ignore generic type inference error here (tanstack problem)
        queryKey: ['projectFormQuestions', currentProjectId],
        queryFn: async () => {
            const data = await getProjectFormQuestions(currentProjectId);
            return data;
        },
        enabled: !!currentProjectId,
    });
    const [groupedQuestions, setGroupedQuestions] = useState<
        GroupedProjectQuestions[]
    >([]);

    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const dirtyInputRef = useRef<Map<string, ProjectDraft>>(new Map());

    const autosave = useDebounceFn(
        async () => {
            setIsSaving(true);

            if (!currentProjectId) return;

            // Find all dirty inputs and create params while clearing dirty flags
            const dirtyInputsSnapshot: ProjectDraft[] = Array.from(
                dirtyInputRef.current.values()
            );
            dirtyInputRef.current.clear();

            try {
                console.log(dirtyInputsSnapshot);
                if (dirtyInputsSnapshot.length > 0) {
                    await saveProjectDraft(
                        currentProjectId,
                        dirtyInputsSnapshot
                    );
                }
            } catch (e) {
                console.error(e);
            } finally {
                setTimeout(() => {
                    setIsSaving(false);
                }, 2000);
            }
        },
        300,
        [currentProjectId]
    );

    const handleChange = (
        questionId: string,
        inputTypeId: string,
        value: any
    ) => {
        const newGroups = groupedQuestions.map((group, idx) => {
            if (currentStep !== idx) return group;
            return {
                ...group,
                subSections: group.subSections.map((subsection) => {
                    return {
                        ...subsection,
                        questions: subsection.questions.map((question) => {
                            if (question.id !== questionId) return question;
                            return {
                                ...question,
                                inputFields: question.inputFields.map(
                                    (field) => {
                                        if (field.key === inputTypeId) {
                                            const key = `${questionId}_${inputTypeId}`;
                                            switch (field.type) {
                                                case 'file':
                                                    break;
                                                case 'team':
                                                    break;

                                                default:
                                                    dirtyInputRef.current.set(
                                                        key,
                                                        {
                                                            question_id:
                                                                questionId,
                                                            input_type_id:
                                                                inputTypeId,
                                                            answer: value,
                                                        }
                                                    );
                                                    break;
                                            }
                                            return {
                                                ...field,
                                                value: {
                                                    ...field.value,
                                                    value: value,
                                                },
                                            };
                                        }
                                        return field;
                                    }
                                ),
                            };
                        }),
                    };
                }),
            };
        });
        setGroupedQuestions(newGroups);
        autosave();
    };

    const handleSubmit = () => {
        console.log(groupedQuestions);
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
        if (questionData) {
            setGroupedQuestions(groupProjectQuestions(questionData));
        }
    }, [questionData]);

    useEffect(() => {
        // create project on mount
        if (!currentProjectId) {
            const newProject = async () => {
                const project = await createProject();
                setCurrentProjectId(project.id);
            };
            newProject();
        }
    }, []);

    const asideLinks = groupedQuestions[currentStep]?.subSectionNames.map(
        (name) => ({
            target: `#${sanitizeHtmlId(name)}`,
            label: name,
        })
    );

    // TODO: make a better loading screen
    if (groupedQuestions.length < 1 || loadingQuestions) return null;

    return (
        <div>
            <nav className="h-24 bg-gray-800"></nav>
            {isSaving && (
                <div className="fixed left-0 right-0 top-0 z-10">
                    <p className="text-center py-2 bg-gray-200">
                        Saving application...
                    </p>
                </div>
            )}
            <SectionedLayout
                asideTitle="Submit a project"
                linkContainerClassnames="top-36"
                links={asideLinks}
            >
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
                                    id={sanitizeHtmlId(subSection.name)}
                                    key={subSection.name}
                                    className={questionGroupContainerStyles()}
                                >
                                    <div>
                                        <h1
                                            className={questionGroupTitleStyles()}
                                        >
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
        </div>
    );
};

export const Route = createFileRoute('/user/_auth/project/new')({
    component: NewProjectPage,
});
