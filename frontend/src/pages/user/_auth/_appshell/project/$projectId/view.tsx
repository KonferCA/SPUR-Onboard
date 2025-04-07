import { Button, type DropdownOption } from '@/components';
import { ReviewQuestions } from '@/components/ReviewQuestions/ReviewQuestions';
import {
    type GroupedProjectQuestions,
    groupProjectQuestions,
    type Question,
} from '@/config';
import { useAuth } from '@/contexts';
import { getProjectComments } from '@/services/comment';
import {
    getLatestProjectSnapshot,
    getProjectDetails,
} from '@/services/project';
import { scrollToTop } from '@/utils';
import { sanitizeHtmlId } from '@/utils/html';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useEffect, useState, useMemo } from 'react';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { ScrollButton } from '@/components';
import { useLocation } from '@tanstack/react-router';
import { useSidebar } from '@/contexts/SidebarContext/SidebarContext';
import { ProjectStatusEnum } from '@/services/projects';
import { usePageTitle } from '@/utils';

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

export const Route = createFileRoute(
    '/user/_auth/_appshell/project/$projectId/view'
)({
    component: RouteComponent,
    beforeLoad: async ({ context, params }) => {
        if (!context || !context.auth?.accessToken) {
            throw redirect({
                to: '/auth',
                replace: true,
            });
        }
        const details = await getProjectDetails(
            context.auth.accessToken,
            params.projectId
        ).catch(console.error);
        if (details) {
            switch (details.status) {
                case ProjectStatusEnum.NeedsReview:
                    if (details.allow_edit) {
                        throw redirect({
                            to: `/user/project/${params.projectId}/form`,
                            replace: true,
                        });
                    }
                    break;
                case ProjectStatusEnum.Draft:
                    throw redirect({
                        to: `/user/project/${params.projectId}/form`,
                        replace: true,
                    });
                default:
                    break;
            }
        }
    },
});

function RouteComponent() {
    // set project view page title
    usePageTitle('Project');

    const { projectId } = Route.useParams();
    const { getAccessToken } = useAuth();
    const navigate = useNavigate({
        from: `/user/project/${projectId}/view`,
    });
    const location = useLocation();
    const { updateProjectConfig } = useSidebar();

    const { data: questionData, isLoading: loadingQuestions } = useQuery({
        //@ts-ignore generic type inference error here (tanstack problem)
        queryKey: ['project_review_questions', projectId],
        queryFn: async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                return;
            }

            const snapshot = await getLatestProjectSnapshot(
                accessToken,
                projectId
            );
            return snapshot.data;
        },
        enabled: !!getAccessToken() && !!projectId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
    });

    const { data: commentsData, isLoading: loadingComments } = useQuery({
        queryKey: ['project_review_comments', projectId],
        queryFn: async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                return;
            }

            const data = await getProjectComments(accessToken, projectId);
            return data;
        },
        enabled: !!getAccessToken() && !!projectId,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });

    const [groupedQuestions, setGroupedQuestions] = useState<
        GroupedProjectQuestions[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [_, setIsMobile] = useState(false);

    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    );

    useEffect(() => {
        if (searchParams.has('section') && groupedQuestions.length > 0) {
            const sectionParam = searchParams.get('section');
            const sectionIndex = groupedQuestions.findIndex(
                (group) =>
                    group.section.toLowerCase().replace(/\s+/g, '-') ===
                    sectionParam
            );

            if (sectionIndex !== -1 && sectionIndex !== currentStep) {
                setCurrentStep(sectionIndex);
            }
        }
    }, [searchParams, groupedQuestions, currentStep]);

    useEffect(() => {
        if (groupedQuestions.length > 0) {
            updateProjectConfig({
                // pass section names to the sidebar
                sections: groupedQuestions.map((group) => group.section),

                // handle when a section is clicked in the sidebar
                sectionClickHandler: (
                    sectionProjectId,
                    section,
                    sectionIndex
                ) => {
                    if (sectionProjectId === projectId) {
                        setCurrentStep(sectionIndex);

                        navigate({
                            to: `/user/project/${projectId}/view`,
                            search: {
                                section: section
                                    .toLowerCase()
                                    .replace(/\s+/g, '-'),
                            },
                            replace: false,
                        });

                        scrollToTop();
                    }
                },

                getActiveSection: () => {
                    if (groupedQuestions.length > 0 && currentStep >= 0) {
                        return groupedQuestions[currentStep].section;
                    }

                    return null;
                },
            });
        }
    }, [
        groupedQuestions,
        projectId,
        currentStep,
        updateProjectConfig,
        navigate,
    ]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
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
            setGroupedQuestions(groupProjectQuestions(questionData));
            setIsLoading(false);
        }
    }, [questionData]);

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

    const handleNextStep = () => {
        if (currentStep < groupedQuestions.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);

            navigate({
                to: `/user/project/${projectId}/view`,
                search: {
                    section: groupedQuestions[nextStep].section
                        .toLowerCase()
                        .replace(/\s+/g, '-'),
                },
                replace: false,
            });

            setTimeout(() => {
                scrollToTop();
            }, 120);
        }
    };

    const handleBackStep = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);

            navigate({
                to: `/user/project/${projectId}/view`,
                search: {
                    section: groupedQuestions[prevStep].section
                        .toLowerCase()
                        .replace(/\s+/g, '-'),
                },
                replace: false,
            });

            setTimeout(() => {
                scrollToTop();
            }, 120);
        }
    };

    if (loadingQuestions || loadingComments || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="sticky top-0 z-40 mt-2">
                    <div className="relative">
                        <div className="flex items-center py-4">
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
                                                onClick={() => {
                                                    setCurrentStep(idx);
                                                    navigate({
                                                        to: `/user/project/${projectId}/view`,
                                                        search: {
                                                            section:
                                                                group.section
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        /\s+/g,
                                                                        '-'
                                                                    ),
                                                        },
                                                        replace: false,
                                                    });
                                                }}
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

                <div className="flex-1 overflow-y-auto">
                    <div className="pt-4">
                        <div className="space-y-12 p-4 lg:p-0 lg:max-w-4xl lg:mx-auto">
                            {groupedQuestions[currentStep].subSections.map(
                                (subsection) => (
                                    <div
                                        id={sanitizeHtmlId(subsection.name)}
                                        key={subsection.name}
                                        className={questionGroupContainerStyles()}
                                    >
                                        <CollapsibleSection
                                            title={subsection.name}
                                        >
                                            <div
                                                className={questionGroupQuestionsContainerStyles()}
                                            >
                                                {subsection.questions.map(
                                                    (q) =>
                                                        shouldRenderQuestion(
                                                            q,
                                                            subsection.questions
                                                        ) ? (
                                                            <ReviewQuestions
                                                                disableCommentCreation
                                                                key={q.id}
                                                                question={q}
                                                                onCreateComment={() => {}}
                                                                comments={
                                                                    commentsData ||
                                                                    []
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
                                    onClick={handleNextStep}
                                    disabled={
                                        currentStep ===
                                        groupedQuestions.length - 1
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollButton />
        </div>
    );
}
