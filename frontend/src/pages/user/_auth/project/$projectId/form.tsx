import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    type AnchorLinkItem,
    AnchorLinks,
    Button,
    SectionDrawer,
    type DropdownOption,
    type UploadableFile,
    ScrollButton,
} from '@components';
import { IoMdArrowRoundBack } from 'react-icons/io';
import {
    getProjectFormQuestions,
    type ProjectDraft,
    saveProjectDraft,
    submitProject,
} from '@/services/project';
import {
    type GroupedProjectQuestions,
    groupProjectQuestions,
    type SectionMetadata,
    type Question,
} from '@/config/forms';
import { cva } from 'class-variance-authority';
import { sanitizeHtmlId } from '@/utils/html';
import { QuestionInputs } from '@/components/QuestionInputs/QuestionInputs';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useQuery } from '@tanstack/react-query';
import { useDebounceFn } from '@/hooks';
import { useAuth, useNotification } from '@/contexts';
import { useNavigate } from '@tanstack/react-router';
import { type ValidationError, ProjectError } from '@/components/ProjectError';
import { RecommendedFields } from '@/components/RecommendedFields';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import type { RecommendedField } from '@/types';
import { isValid as isValidDate } from 'date-fns';
import { scrollToTop } from '@/utils';

export const Route = createFileRoute('/user/_auth/project/$projectId/form')({
    component: ProjectFormPage,
});

const stepItemStyles = cva(
    'text-lg relative transition text-gray-400 hover:text-button-secondary-100 hover:cursor-pointer py-2',
    {
        variants: {
            active: {
                true: 'font-semibold !text-button-secondary-100',
            },
        },
    }
);

const questionGroupContainerStyles = cva('');
const questionGroupQuestionsContainerStyles = cva('space-y-6');

const isEmptyValue = (value: unknown, type: string): boolean => {
    if (value === null || value === undefined) {
        return true;
    }

    switch (type) {
        case 'textinput':
        case 'textarea':
            return (value as string).trim() === '';
        case 'select':
        case 'multiselect':
            return (value as string).length === 0;
        case 'date':
            return isValidDate(value);
        default:
            return false;
    }
};

function ProjectFormPage() {
    const notification = useNotification();
    const { projectId: currentProjectId } = Route.useParams();
    const navigate = useNavigate({
        from: `/user/project/${currentProjectId}/form`,
    });
    const { accessToken, companyId } = useAuth();
    const { data: questionData, isLoading: loadingQuestions } = useQuery({
        //@ts-ignore generic type inference error here (tanstack problem)
        queryKey: ['projectFormQuestions', accessToken, currentProjectId],
        queryFn: async () => {
            if (!accessToken || !currentProjectId) {
                return;
            }

            const data = await getProjectFormQuestions(
                accessToken,
                currentProjectId
            );
            return data;
        },
        enabled: !!currentProjectId,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    });

    const [groupedQuestions, setGroupedQuestions] = useState<
        GroupedProjectQuestions[]
    >([]);
    const [sectionsMetadata, setSectionMetadata] = useState<SectionMetadata[]>(
        []
    );
    const [currentStep, setCurrentStep] = useState<number>(0);
    const dirtyInputRef = useRef<Map<string, ProjectDraft>>(new Map());
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showRecommendedModal, setShowRecommendedModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
        []
    );
    const [recommendedFields, setRecommendedFields] = useState<
        RecommendedField[]
    >([]);
    const [autosaveStatus, setAutosaveStatus] = useState<
        'idle' | 'saving' | 'success' | 'error'
    >('idle');
    const [isSaving, setIsSaving] = useState(false);

    // state to track which question should be highlighted
    const [highlightedQuestionId, setHighlightedQuestionId] = useState<{
        id: string | null;
        type: 'error' | 'neutral';
    }>({ id: null, type: 'error' });
    const [isMobile, setIsMobile] = useState(false);

    const autosave = useDebounceFn(
        async () => {
            if (!currentProjectId || !accessToken || !companyId || isSaving) {
                return;
            }

            // find all dirty inputs and create params while clearing dirty flags
            const dirtyInputsSnapshot: ProjectDraft[] = Array.from(
                dirtyInputRef.current.values()
            );
            dirtyInputRef.current.clear();

            setIsSaving(true);

            try {
                if (dirtyInputsSnapshot.length > 0) {
                    setAutosaveStatus('saving');

                    await new Promise((resolve) => setTimeout(resolve, 300));
                    await saveProjectDraft(
                        accessToken,
                        currentProjectId,
                        dirtyInputsSnapshot
                    );

                    setAutosaveStatus('success');
                }
            } catch (e) {
                console.error(e);
                setAutosaveStatus('error');
            } finally {
                setIsSaving(false);
            }
        },
        1500,
        [currentProjectId, accessToken, companyId, isSaving]
    );

    const handleManualSave = useCallback(async () => {
        if (!currentProjectId || !accessToken || !companyId || isSaving) {
            return;
        }

        const dirtyInputsSnapshot: ProjectDraft[] = Array.from(
            dirtyInputRef.current.values()
        );

        if (dirtyInputsSnapshot.length === 0) {
            return; // nothing to save
        }

        setIsSaving(true);
        setAutosaveStatus('saving');

        try {
            await saveProjectDraft(
                accessToken,
                currentProjectId,
                dirtyInputsSnapshot
            );
            dirtyInputRef.current.clear();
            setAutosaveStatus('success');
        } catch (error) {
            console.error(error);
            setAutosaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    }, [accessToken, companyId, currentProjectId, isSaving]);

    // use the keyboard shortcut hook
    useKeyboardShortcut({ key: 's', ctrlKey: true }, handleManualSave, [
        handleManualSave,
    ]);

    const handleChange = (
        questionId: string,
        inputFieldKey: string,
        value: unknown
    ) => {
        setGroupedQuestions((prevGroups) => {
            const newGroups = prevGroups.map((group, idx) => {
                // ONLY process the current step
                if (currentStep !== idx) {
                    return group;
                }

                return {
                    ...group,
                    subSections: group.subSections.map((subsection) => ({
                        ...subsection,
                        questions: subsection.questions.map((question) => {
                            // Process file uploads separately from other field types
                            const isFileInput = question.inputFields.some(
                                (f) =>
                                    f.type === 'file' && f.key === inputFieldKey
                            );

                            if (isFileInput) {
                                // Handle file upload case
                                return {
                                    ...question,
                                    inputFields: question.inputFields.map(
                                        (field) => {
                                            if (field.key !== inputFieldKey) {
                                                return field;
                                            }

                                            const files =
                                                value as UploadableFile[];

                                            // if we're clearing files
                                            if (files.length === 0) {
                                                return {
                                                    ...field,
                                                    value: {
                                                        ...field.value,
                                                        value: [],
                                                    },
                                                };
                                            }

                                            // handle file upload state
                                            const uploadedFiles = files.filter(
                                                (f) => f.metadata?.id
                                            );
                                            if (uploadedFiles.length > 0) {
                                                dirtyInputRef.current.set(
                                                    inputFieldKey,
                                                    {
                                                        question_id:
                                                            inputFieldKey,
                                                        answer:
                                                            uploadedFiles[0]
                                                                .metadata?.id ||
                                                            '',
                                                    }
                                                );

                                                setTimeout(() => autosave(), 0);
                                            }

                                            return {
                                                ...field,
                                                value: {
                                                    ...field.value,
                                                    value: files,
                                                },
                                            };
                                        }
                                    ),
                                };
                            }

                            // handle non-file fields
                            if (question.id !== questionId) {
                                return question;
                            }

                            return {
                                ...question,
                                inputFields: question.inputFields.map(
                                    (field) => {
                                        if (field.key !== inputFieldKey) {
                                            return field;
                                        }

                                        const newValue = value;

                                        switch (field.type) {
                                            case 'select':
                                            case 'multiselect': {
                                                const choices =
                                                    value as DropdownOption[];
                                                dirtyInputRef.current.set(
                                                    questionId,
                                                    {
                                                        question_id: questionId,
                                                        answer: choices.map(
                                                            (c) => c.value
                                                        ),
                                                    }
                                                );
                                                break;
                                            }
                                            case 'date': {
                                                const date = value as Date;

                                                dirtyInputRef.current.set(
                                                    questionId,
                                                    {
                                                        question_id: questionId,
                                                        answer: date
                                                            .toISOString()
                                                            .split('T')[0],
                                                    }
                                                );
                                                break;
                                            }

                                            default:
                                                dirtyInputRef.current.set(
                                                    questionId,
                                                    {
                                                        question_id: questionId,
                                                        answer: value as
                                                            | string
                                                            | string[],
                                                    }
                                                );
                                                break;
                                        }

                                        setTimeout(() => autosave(), 0);

                                        return {
                                            ...field,
                                            value: {
                                                ...field.value,
                                                value: newValue,
                                            },
                                        };
                                    }
                                ),
                            };
                        }),
                    })),
                };
            });
            return newGroups;
        });
    };

    const handleNextStep = () => {
        setCurrentStep((curr) => {
            if (curr < groupedQuestions.length - 1) {
                return curr + 1;
            }

            return curr;
        });
        setTimeout(() => {
            scrollToTop();
        }, 120);
    };

    const handleBackStep = () => {
        setCurrentStep((curr) => {
            if (curr > 0) {
                return curr - 1;
            }

            return curr;
        });
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1536);
        };
        setTimeout(() => {
            scrollToTop();
        }, 120);

        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (questionData) {
            const groups = groupProjectQuestions(questionData);
            const sections = groups.map((g) => {
                const metadata: SectionMetadata = {
                    name: g.section,
                    subSections: g.subSectionNames,
                };
                return metadata;
            });
            setGroupedQuestions(groups);
            setSectionMetadata(sections);
        }
    }, [questionData]);

    const asideLinks = useMemo<AnchorLinkItem[]>(() => {
        return sectionsMetadata[currentStep]?.subSections.map((name) => ({
            target: `#${sanitizeHtmlId(name)}`,
            label: name,
            offset: 208,
            offsetType: 'after',
        }));
    }, [currentStep, sectionsMetadata]);

    const shouldRenderQuestion = (
        question: Question,
        allQuestions: Question[]
    ) => {
        if (!question.dependentQuestionId) {
            return true;
        }

        const dependentQuestion = allQuestions.find(
            (q) => q.id === question.dependentQuestionId
        );

        if (!dependentQuestion) {
            return true;
        }

        // find the answer in the grouped questions
        let dependentAnswer: string | DropdownOption[] = '';

        for (const group of groupedQuestions) {
            for (const subSection of group.subSections) {
                const foundQuestion = subSection.questions.find(
                    (q) => q.id === question.dependentQuestionId
                );

                if (foundQuestion?.inputFields[0]?.value.value) {
                    dependentAnswer = foundQuestion.inputFields[0].value
                        .value as string | DropdownOption[];
                    break;
                }
            }
        }

        if (Array.isArray(dependentAnswer)) {
            switch (question.conditionType?.conditionTypeEnum) {
                case 'empty':
                    return dependentAnswer.length === 0;
                case 'not_empty':
                    return dependentAnswer.length > 0;
                case 'equals':
                    return dependentAnswer.every(
                        (a) => a.value === question.conditionValue
                    );
                case 'contains':
                    return (
                        dependentAnswer.findIndex(
                            (a) => a.value === question.conditionValue
                        ) !== -1
                    );
                default:
                    return true;
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
        const invalidQuestions: ValidationError[] = [];
        const recommended: RecommendedField[] = [];

        let isValid = true;

        groupedQuestions.forEach((group) => {
            group.subSections.forEach((subsection) => {
                subsection.questions.forEach((question) => {
                    // if question is dependent on previous and it should be rendered
                    // then we check the answer of this input
                    if (
                        question.conditionType?.valid &&
                        !shouldRenderQuestion(question, subsection.questions)
                    ) {
                        return;
                    }

                    question.inputFields.forEach((input) => {
                        let fieldValid = true;

                        input.invalid = false;

                        if (
                            !input.required &&
                            isEmptyValue(input.value.value, input.type)
                        ) {
                            recommended.push({
                                section: group.section,
                                subsection: subsection.name,
                                questionText: question.question,
                                inputType: input.type,
                            });
                            return;
                        }

                        switch (input.type) {
                            case 'date':
                                fieldValid = isValidDate(input.value.value);
                                break;
                            case 'textarea':
                            case 'textinput':
                                if (!input.value.value) {
                                    fieldValid = false;
                                } else if (input.validations) {
                                    fieldValid = input.validations.every(
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
                                    fieldValid = false;
                                } else if (input.validations) {
                                    const values = input.value
                                        .value as string[];
                                    fieldValid = values.every((v) =>
                                        input.validations?.every(
                                            (validation) =>
                                                validation.safeParse(v).success
                                        )
                                    );
                                }
                                break;
                            case 'file':
                                if (
                                    input.required &&
                                    (!input.value.files ||
                                        input.value.files.length === 0)
                                ) {
                                    fieldValid = false;
                                }
                                break;
                            default:
                                break;
                        }

                        input.invalid = !fieldValid;

                        if (!fieldValid) {
                            invalidQuestions.push({
                                section: group.section,
                                subsection: subsection.name,
                                questionText: question.question,
                                inputType: input.type,
                                required: input.required ?? false,
                                value: input.value,
                                reason: !input.value.value
                                    ? 'Missing required value'
                                    : 'Failed validation',
                                questionId: question.id,
                            });

                            isValid = false;
                        }
                    });
                });
            });
        });

        setRecommendedFields(recommended);

        if (isValid) {
            setValidationErrors([]);

            if (recommended.length > 0) {
                setShowRecommendedModal(true);
            } else {
                setShowSubmitModal(true);
            }
        } else {
            setValidationErrors(invalidQuestions);
            setGroupedQuestions((prev) => [...prev]);
        }
    };

    const handleSubmitConfirm = async () => {
        try {
            if (!accessToken || !currentProjectId) {
                return;
            }

            await submitProject(accessToken, currentProjectId);

            notification.push({
                message:
                    'Your project has been submitted! Please give us a few weeks to review your project!',
                level: 'success',
            });

            // replace to not let them go back, it causes the creation of a new project
            navigate({ to: '/user/dashboard', replace: true });
        } catch (e) {
            notification.push({
                message:
                    'Oops, seems like something went wrong. Please try again later.',
                level: 'error',
            });
            console.error(e);
        }
    };

    // helper func to check if an element is in the viewport
    const isElementInViewport = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
                (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    const handleErrorClick = (
        section: string,
        subsectionId: string,
        questionId?: string,
        highlightType: 'error' | 'neutral' = 'error'
    ) => {
        const sectionIndex = groupedQuestions.findIndex(
            (group) => group.section === section
        );

        if (sectionIndex !== -1) {
            setCurrentStep(sectionIndex);

            // delay to allow the step change to render
            setTimeout(() => {
                const subsectionElement = document.getElementById(subsectionId);

                if (!subsectionElement) return;

                // collect info on target question
                let targetQuestionId = questionId;

                if (!targetQuestionId) {
                    // find the first or invalid question if no specific question was provided
                    const subsection = groupedQuestions[
                        sectionIndex
                    ].subSections.find(
                        (sub) => sanitizeHtmlId(sub.name) === subsectionId
                    );

                    if (subsection && subsection.questions.length > 0) {
                        // find the first invalid question if available
                        const invalidQuestion = subsection.questions.find((q) =>
                            q.inputFields.some((field) => field.invalid)
                        );

                        // use either the invalid question or the first one
                        const targetQuestion =
                            invalidQuestion || subsection.questions[0];
                        targetQuestionId = targetQuestion.id;
                    }
                }

                if (!targetQuestionId) return;

                const targetElement = document.getElementById(targetQuestionId);

                // check if the target is already in viewport
                const isTargetInView =
                    targetElement && isElementInViewport(targetElement);

                if (isTargetInView) {
                    // if already in view, highlight immediately
                    setHighlightedQuestionId({
                        id: targetQuestionId,
                        type: highlightType,
                    });
                    setHighlightedQuestionId({
                        id: targetQuestionId,
                        type: highlightType,
                    });
                    setTimeout(
                        () =>
                            setHighlightedQuestionId({
                                id: null,
                                type: highlightType,
                            }),
                        1200
                    );
                } else {
                    // if not in view, scroll and wait for scrolling to finish
                    subsectionElement.scrollIntoView({ behavior: 'smooth' });

                    // create a one-time scroll event listener to detect when scrolling stops
                    let scrollTimeout: NodeJS.Timeout;
                    const handleScrollEnd = () => {
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            // scrolling has stopped
                            setHighlightedQuestionId({
                                id: targetQuestionId,
                                type: highlightType,
                            });
                            setTimeout(
                                () =>
                                    setHighlightedQuestionId({
                                        id: null,
                                        type: highlightType,
                                    }),
                                1200
                            );

                            // remove the event listener
                            window.removeEventListener(
                                'scroll',
                                handleScrollEnd
                            );
                        }, 100);
                    };

                    window.addEventListener('scroll', handleScrollEnd);

                    // fallback in case scroll event doesn't fire or scrolling is very short
                    setTimeout(() => {
                        if (highlightedQuestionId.id !== targetQuestionId) {
                            setHighlightedQuestionId({
                                id: targetQuestionId,
                                type: highlightType,
                            });
                            setTimeout(
                                () =>
                                    setHighlightedQuestionId({
                                        id: null,
                                        type: highlightType,
                                    }),
                                1200
                            );
                            window.removeEventListener(
                                'scroll',
                                handleScrollEnd
                            );
                        }
                    }, 600);
                }
            }, 100);
        }
    };

    // Handle subsection link clicks from the navigation pane
    const handleSubsectionLinkClick = (targetId: string) => {
        const sectionIndex = currentStep;

        // Find the subsection without the # prefix
        const subsectionId = targetId.startsWith('#')
            ? targetId.substring(1)
            : targetId;

        // Find the first question in this subsection to highlight
        const subsection = groupedQuestions[sectionIndex]?.subSections.find(
            (sub) => sanitizeHtmlId(sub.name) === subsectionId
        );

        if (subsection && subsection.questions.length > 0) {
            // Set a timeout to allow the scroll to complete first
            setTimeout(() => {
                const firstQuestion = subsection.questions[0];
                setHighlightedQuestionId({
                    id: firstQuestion.id,
                    type: 'neutral',
                });
                setTimeout(
                    () =>
                        setHighlightedQuestionId({ id: null, type: 'neutral' }),
                    1200
                );
            }, 500);
        }
    };

    // TODO: make a better loading screen
    if (groupedQuestions.length < 1 || loadingQuestions) return null;

    return (
        <div className="min-h-screen">
            <div className="fixed top-0 left-0 right-0 z-50">
                <nav className="bg-white h-16 border-b border-gray-200">
                    <div className="h-full px-4 flex items-center">
                        <Link
                            to="/user/dashboard"
                            className="transition p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
                        >
                            <IoMdArrowRoundBack />
                            <span> Back to dashboard </span>
                        </Link>
                    </div>
                </nav>

                <AutoSaveIndicator status={autosaveStatus} />

                <div className="bg-white border-b border-gray-200">
                    <div className="relative">
                        <div className="flex items-center py-4">
                            <div className="hidden md:block absolute left-0">
                                <h1 className="text-lg font-semibold text-gray-900 pl-6">
                                    {groupedQuestions[currentStep]?.section}
                                </h1>
                            </div>

                            <div className="flex-1 flex justify-center overflow-x-auto px-6">
                                <nav className="relative overflow-x-auto">
                                    <ul className="flex items-center space-x-8 overflow-x-auto">
                                        {groupedQuestions.map((group, idx) => (
                                            <li
                                                key={`step_${group.section}`}
                                                className={stepItemStyles({
                                                    active: currentStep === idx,
                                                })}
                                                onKeyUp={() =>
                                                    setCurrentStep(idx)
                                                }
                                                onClick={() =>
                                                    setCurrentStep(idx)
                                                }
                                            >
                                                <span className="text-nowrap">
                                                    {group.section}
                                                </span>
                                                {currentStep === idx && (
                                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-button-secondary-100" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200" />
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-52">
                <div className="hidden 2xl:block fixed w-60 3xl:w-80 max-h-96 overflow-y-auto left-12">
                    <AnchorLinks
                        links={asideLinks}
                        onClick={(link) =>
                            handleSubsectionLinkClick(link.target)
                        }
                    />
                </div>
                <div className="hidden 2xl:block fixed w-60 3xl:w-80 right-12">
                    {validationErrors.length > 0 && (
                        <ProjectError
                            errors={validationErrors}
                            onErrorClick={handleErrorClick}
                        />
                    )}
                </div>

                <form className="space-y-12 p-4 lg:p-0 lg:max-w-4xl lg:mx-auto">
                    {groupedQuestions[currentStep].subSections.map(
                        (subsection) => (
                            <div
                                id={sanitizeHtmlId(subsection.name)}
                                key={subsection.name}
                                className={questionGroupContainerStyles()}
                            >
                                <CollapsibleSection title={subsection.name}>
                                    <div
                                        className={questionGroupQuestionsContainerStyles()}
                                    >
                                        {subsection.questions.map((q) =>
                                            shouldRenderQuestion(
                                                q,
                                                subsection.questions
                                            ) ? (
                                                <QuestionInputs
                                                    key={q.id}
                                                    question={q}
                                                    onChange={handleChange}
                                                    shouldHighlight={
                                                        q.id ===
                                                        highlightedQuestionId.id
                                                            ? highlightedQuestionId.type
                                                            : false
                                                    }
                                                    fileUploadProps={
                                                        accessToken
                                                            ? {
                                                                  projectId:
                                                                      currentProjectId,
                                                                  questionId:
                                                                      q.id,
                                                                  section:
                                                                      groupedQuestions[
                                                                          currentStep
                                                                      ].section,
                                                                  subSection:
                                                                      subsection.name,
                                                                  accessToken:
                                                                      accessToken,
                                                                  enableAutosave: true,
                                                              }
                                                            : undefined
                                                    }
                                                />
                                            ) : null
                                        )}
                                    </div>
                                </CollapsibleSection>
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

            {/* scroll to top/bottom button */}
            <ScrollButton />

            {isMobile && (
                <SectionDrawer
                    activeSection={groupedQuestions[currentStep]?.section || ''}
                    subSectionLinks={asideLinks || []}
                    validationErrors={validationErrors}
                    recommendedFields={recommendedFields}
                    onRequestChangeSection={(section) => {
                        if (isMobile) {
                            const idx = groupedQuestions.findIndex(
                                (group) => group.section === section
                            );
                            if (idx !== -1) {
                                setCurrentStep(idx);
                            }
                            return true;
                        }
                        return false;
                    }}
                    onErrorClick={(section, subsection, questionId) =>
                        handleErrorClick(
                            section,
                            subsection,
                            questionId,
                            'error'
                        )
                    }
                    onRecommendedFieldClick={(
                        section,
                        subsection,
                        questionId
                    ) =>
                        handleErrorClick(
                            section,
                            subsection,
                            questionId,
                            'neutral'
                        )
                    }
                />
            )}

            <ConfirmationModal
                isOpen={showRecommendedModal}
                onClose={() => setShowRecommendedModal(false)}
                primaryAction={() => setShowSubmitModal(true)}
                title="Recommended Fields"
                primaryActionText="Continue"
            >
                <RecommendedFields
                    fields={recommendedFields}
                    onFieldClick={(section, subsection, questionId) => {
                        handleErrorClick(
                            section,
                            subsection,
                            questionId,
                            'neutral'
                        );
                        setShowRecommendedModal(false);
                    }}
                />
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                primaryAction={handleSubmitConfirm}
                title="Submit Application?"
                primaryActionText="Yes, submit it"
            >
                <div className="space-y-4">
                    <p>Have you double-checked everything in this project?</p>

                    <p>
                        Once submitted, you won't be able to make changes until
                        the application is either approved or sent back for
                        review.
                    </p>
                </div>
            </ConfirmationModal>
        </div>
    );
}
