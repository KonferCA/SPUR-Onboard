import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Button, UploadableFile } from '@components';
import {
    createProject,
    getProjectFormQuestions,
    ProjectDraft,
    removeDocument,
    saveProjectDraft,
    submitProject,
    uploadDocument,
} from '@/services/project';
import {
    GroupedProjectQuestions,
    groupProjectQuestions,
    Question,
    SubSection,
} from '@/config/forms';
import { SectionedLayout } from '@/templates';
import { cva } from 'class-variance-authority';
import { sanitizeHtmlId } from '@/utils/html';
import { QuestionInputs } from '@/components/QuestionInputs/QuestionInputs';
import { useQuery } from '@tanstack/react-query';
import { scrollToTop } from '@/utils';
import { useDebounceFn } from '@/hooks';
import { useAuth } from '@/contexts';
import { FormField } from '@/types';
import { getSampleAnswer } from '@/utils/sampleData';
import { useNavigate } from '@tanstack/react-router';

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

interface FileChange {
    action: 'add' | 'remove';
    file: UploadableFile;
    metadata: {
        questionId: string;
        section: string;
        subSection: string;
    };
}

const NewProjectPage = () => {
    const navigate = useNavigate({ from: '/user/project/new' });
    const [currentProjectId, setCurrentProjectId] = useState('');
    const { data: questionData, isLoading: loadingQuestions } = useQuery({
        //@ts-ignore generic type inference error here (tanstack problem)
        queryKey: ['projectFormQuestions', currentProjectId],
        queryFn: async () => {
            const data = await getProjectFormQuestions(currentProjectId);
            return data;
        },
        enabled: !!currentProjectId,
        // if this is not set  to infity, data is refetched on window focus
        // aka, when the mouse re-enters the browser window... which is dumb
        // and causes a lot of data transfer that is not needed.
        staleTime: Infinity,
    });
    const [groupedQuestions, setGroupedQuestions] = useState<
        GroupedProjectQuestions[]
    >([]);

    const [isSaving, setIsSaving] = useState(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const dirtyInputRef = useRef<Map<string, ProjectDraft>>(new Map());
    const fileChangesRef = useRef<Map<string, FileChange>>(new Map());

    const { accessToken, companyId } = useAuth();

    const autosave = useDebounceFn(
        async () => {
            if (!currentProjectId || !accessToken || !companyId) return;
            setIsSaving(true);

            // Find all dirty inputs and create params while clearing dirty flags
            const dirtyInputsSnapshot: ProjectDraft[] = Array.from(
                dirtyInputRef.current.values()
            );
            dirtyInputRef.current.clear();

            // TODO: handle file changes
            const fileChanges = Array.from(fileChangesRef.current.values());
            fileChangesRef.current.clear();

            try {
                // TODO: handle file changes
                if (fileChanges.length > 0) {
                    // Process file changes
                    await Promise.all(
                        fileChanges.map(async (change) => {
                            if (
                                change.action === 'remove' &&
                                change.file.metadata?.id
                            ) {
                                await removeDocument(accessToken, {
                                    projectId: currentProjectId,
                                    documentId: change.file.metadata.id,
                                });
                            } else if (change.action === 'add') {
                                const response = await uploadDocument(
                                    accessToken,
                                    {
                                        projectId: currentProjectId,
                                        file: change.file,
                                        questionId: change.metadata.questionId,
                                        name: change.file.name,
                                        section: change.metadata.section,
                                        subSection: change.metadata.subSection,
                                    }
                                );
                                change.file.metadata = response;
                                change.file.uploaded = true;
                            }
                        })
                    );
                }

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
        1500,
        [currentProjectId, accessToken, companyId]
    );

    const handleFileChange = (
        questionId: string,
        group: GroupedProjectQuestions,
        subsection: SubSection,
        field: FormField,
        files: UploadableFile[]
    ) => {
        const currentFiles = (field.value?.value || []) as UploadableFile[];

        // Track removed files
        currentFiles.forEach((file) => {
            if (!files.find((f) => f.metadata?.id === file.metadata?.id)) {
                const changeKey = `remove_${file.metadata?.id}`;
                fileChangesRef.current.set(changeKey, {
                    action: 'remove',
                    file,
                    metadata: {
                        questionId,
                        section: group.section,
                        subSection: subsection.name,
                    },
                });
            }
        });

        // Track new files
        files.forEach((file) => {
            if (!file.uploaded) {
                const changeKey = `add_${file.name}_${Date.now()}`;
                fileChangesRef.current.set(changeKey, {
                    action: 'add',
                    file,
                    metadata: {
                        questionId,
                        section: group.section,
                        subSection: subsection.name,
                    },
                });
            }
        });
        return {
            ...field,
            value: {
                ...field.value,
                files,
            },
        };
    };

    const handleChange = (
        questionId: string,
        inputFieldKey: string,
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
                                        if (field.key === inputFieldKey) {
                                            const key = `${questionId}_${inputFieldKey}`;
                                            switch (field.type) {
                                                case 'file':
                                                    return handleFileChange(
                                                        questionId,
                                                        group,
                                                        subsection,
                                                        field,
                                                        value as UploadableFile[]
                                                    );
                                                default:
                                                    dirtyInputRef.current.set(
                                                        key,
                                                        {
                                                            question_id:
                                                                questionId,
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

    const handleFillSampleData = () => {
        const newGroups = groupedQuestions.map((group) => ({
            ...group,
            subSections: group.subSections.map((subsection) => ({
                ...subsection,
                questions: subsection.questions.map((question) => ({
                    ...question,
                    inputFields: question.inputFields.map((field) => {
                        const key = `${question.id}_${field.key}`;

                        // Skip file and team input types
                        if (field.type === 'file' || field.type === 'team') {
                            return field;
                        }

                        const sampleValue = getSampleAnswer(
                            question.question,
                            field.type
                        );

                        // Add to dirty inputs for saving
                        dirtyInputRef.current.set(key, {
                            question_id: question.id,
                            answer: sampleValue,
                        });

                        return {
                            ...field,
                            value: {
                                ...field.value,
                                value: sampleValue,
                            },
                        };
                    }),
                })),
            })),
        }));

        setGroupedQuestions(newGroups);
        autosave();
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

    const shouldRenderQuestion = (
        question: Question,
        allQuestions: Question[]
    ) => {
        if (!question.dependentQuestionId) return true;

        const dependentQuestion = allQuestions.find(
            (q) => q.id === question.dependentQuestionId
        );
        if (!dependentQuestion) return true;

        // Find the answer in the grouped questions
        let dependentAnswer = '';
        for (const group of groupedQuestions) {
            for (const subSection of group.subSections) {
                const foundQuestion = subSection.questions.find(
                    (q) => q.id === question.dependentQuestionId
                );
                if (
                    foundQuestion &&
                    foundQuestion.inputFields[0]?.value.value
                ) {
                    dependentAnswer = foundQuestion.inputFields[0].value.value;
                    break;
                }
            }
        }

        switch (question.conditionType?.conditionTypeEnum) {
            case 'empty':
                return !dependentAnswer;
            case 'not_empty':
                return !!dependentAnswer;
            case 'equals':
                return dependentAnswer === question.conditionValue;
            case 'contains':
                return dependentAnswer.includes(question.conditionValue || '');
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        // validate all the questions
        const valid = groupedQuestions.every((group) => {
            return group.subSections.every((subsection) => {
                return subsection.questions.every((question) => {
                    // if question is dependent on previous and it should be rendered
                    // then we check the answer of this input
                    if (
                        question.conditionType &&
                        question.conditionType.valid &&
                        !shouldRenderQuestion(question, subsection.questions)
                    ) {
                        return true;
                    }

                    return question.inputFields.every((input) => {
                        let valid = true;

                        // reset invalid state
                        input.invalid = false;

                        if (!input.required && !input.value.value) return true;

                        switch (input.type) {
                            case 'date':
                            case 'textarea':
                            case 'textinput':
                                if (!input.value.value) {
                                    valid = false;
                                } else if (input.validations) {
                                    valid = input.validations.every(
                                        (validation) =>
                                            validation.safeParse(
                                                input.value.value
                                            ).success
                                    );
                                }
                                break;
                            case 'select':
                            case 'multiselect':
                                if (
                                    !Array.isArray(input.value.value) ||
                                    !input.value.value.length
                                ) {
                                    return false;
                                } else if (input.validations) {
                                    const values = input.value
                                        .value as string[];
                                    valid = values.every((v) =>
                                        input.validations?.every(
                                            (validation) =>
                                                validation.safeParse(v).success
                                        )
                                    );
                                }
                                break;

                            default:
                                break;
                        }

                        input.invalid = !valid;

                        return valid;
                    });
                });
            });
        });

        if (valid) {
            try {
                if (!accessToken || !currentProjectId) return;
                await submitProject(accessToken, currentProjectId);
                // replace to not let them go back, it causes the creation of a new project
                navigate({ to: '/user/dashboard', replace: true });
            } catch (e) {
                console.error(e);
            }
        } else {
            // update the group questions so that it refreshes the ui
            setGroupedQuestions((prev) => [...prev]);
        }
    };

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
                    <div className="flex justify-end px-4 py-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleFillSampleData}
                        >
                            Fill with Sample Data
                        </Button>
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
                                        {subSection.questions.map((q) =>
                                            shouldRenderQuestion(
                                                q,
                                                subSection.questions
                                            ) ? (
                                                <QuestionInputs
                                                    key={q.id}
                                                    question={q}
                                                    onChange={handleChange}
                                                />
                                            ) : null
                                        )}
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
