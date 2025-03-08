import { Button, type DropdownOption } from '@/components';
import { ReviewQuestions } from '@/components/ReviewQuestions/ReviewQuestions';
import {
    type GroupedProjectQuestions,
    groupProjectQuestions,
    type Question,
} from '@/config/forms';
import { useAuth } from '@/contexts';
import { createProjectComment, getProjectComments } from '@/services/comment';
import { getProjectFormQuestions } from '@/services/project';
import { SectionedLayout } from '@/templates';
import { scrollToTop } from '@/utils';
import { sanitizeHtmlId } from '@/utils/html';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { CollapsibleSection } from '@/components/CollapsibleSection';

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
const questionGroupQuestionsContainerStyles = cva('space-y-6');

export const Route = createFileRoute('/admin/_auth/projects/$projectId/review')(
    {
        component: RouteComponent,
    }
);

function RouteComponent() {
    const { projectId } = Route.useParams();
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const { data: questionData, isLoading: loadingQuestions } = useQuery({
        //@ts-ignore generic type inference error here (tanstack problem)
        queryKey: ['project_review_questions', accessToken, projectId],
        queryFn: async () => {
            if (!accessToken) return;
            const data = await getProjectFormQuestions(accessToken, projectId);
            return data;
        },
        enabled: !!accessToken && !!projectId,
        // if this is not set  to infity, data is refetched on window focus
        // aka, when the mouse re-enters the browser window... which is dumb
        // and causes a lot of data transfer that is not needed.
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
    });
    const { data: commentsData, isLoading: loadingComments } = useQuery({
        queryKey: ['project_review_comments', accessToken, projectId],
        queryFn: async () => {
            if (!accessToken) return;
            const data = await getProjectComments(accessToken, projectId);
            return data;
        },
        enabled: !!accessToken && !!projectId,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
    });
    const [groupedQuestions, setGroupedQuestions] = useState<
        GroupedProjectQuestions[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<number>(0);

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
        if (!question.dependentQuestionId) return true;

        const dependentQuestion = allQuestions.find(
            (q) => q.id === question.dependentQuestionId
        );
        if (!dependentQuestion) return true;

        // Find the answer in the grouped questions
        let dependentAnswer: string | DropdownOption[] = '';
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
        } else {
            switch (question.conditionType?.conditionTypeEnum) {
                case 'empty':
                    return !dependentAnswer;
                case 'not_empty':
                    return !!dependentAnswer;
                case 'equals':
                    return dependentAnswer === question.conditionValue;
                case 'contains':
                    return dependentAnswer.includes(
                        question.conditionValue || ''
                    );
                default:
                    return true;
            }
        }
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

    const asideLinks = groupedQuestions[currentStep]?.subSectionNames.map(
        (name) => ({
            target: `#${sanitizeHtmlId(name)}`,
            label: name,
        })
    );

    if (loadingQuestions || loadingComments || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white h-24 border-b border-gray-300">
                <ul className="flex items-center pl-4 h-full">
                    <li>
                        <Link
                            to="/admin/dashboard"
                            className="transition p-2 inline-block rounded-lg hover:bg-gray-100"
                        >
                            <div className="flex items-center gap-2">
                                <span>
                                    <IoMdArrowRoundBack />
                                </span>
                                <span>Back to dashboard</span>
                            </div>
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className="h-24"></div>
            <SectionedLayout
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
                    <div className="space-y-12 lg:max-w-3xl mx-auto mt-12">
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
                                                    <ReviewQuestions
                                                        key={q.id}
                                                        question={q}
                                                        onCreateComment={async (
                                                            comment,
                                                            targetId
                                                        ) => {
                                                            if (!accessToken)
                                                                return;
                                                            await createProjectComment(
                                                                accessToken,
                                                                projectId,
                                                                {
                                                                    comment,
                                                                    targetId,
                                                                }
                                                            );
                                                            queryClient.invalidateQueries(
                                                                {
                                                                    queryKey: [
                                                                        'project_review_comments',
                                                                        accessToken,
                                                                        projectId,
                                                                    ],
                                                                }
                                                            );
                                                        }}
                                                        comments={
                                                            commentsData || []
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
                                        : () =>
                                              navigate({
                                                  to: `/admin/projects/${projectId}/decision`,
                                              })
                                }
                            >
                                {currentStep < groupedQuestions.length - 1
                                    ? 'Continue'
                                    : 'Finalize Decision'}
                            </Button>
                        </div>
                    </div>
                </div>
            </SectionedLayout>
        </div>
    );
}
