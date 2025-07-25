import type { ExtendedProjectResponse } from '@/types/project';
import { formatUnixTimestamp } from '@/utils/date';
import { Badge, Button, Card } from '@components';
import type { BadgeProps } from '@/components';
import { type ReactNode, useNavigate } from '@tanstack/react-router';
import { type FC, useState, useEffect } from 'react';
import { ProjectStatusEnum, updateProjectStatus } from '@/services/projects';
import { WithdrawProjectModal } from '../WithdrawProjectModal/WithdrawProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
    FiMoreVertical,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiSlash,
    FiFileText,
} from 'react-icons/fi';
import clsx from 'clsx';

export interface ProjectCardProps {
    data: ExtendedProjectResponse;
}

interface InfoSectionProps {
    label: string;
    children: ReactNode;
}

interface MobileInfoRowProps {
    label: string;
    value: ReactNode;
}

const InfoSection: FC<InfoSectionProps> = ({ label, children }) => {
    return (
        <div className="flex flex-col items-start gap-1">
            <p className="text-base text-gray-500">{label}</p>
            <div className="text-base font-medium text-gray-900">
                {children}
            </div>
        </div>
    );
};

const MobileInfoRow: FC<MobileInfoRowProps> = ({ label, value }) => {
    return (
        <div className="flex justify-between items-center">
            <p className="text-gray-500">{label}</p>
            <div className="font-medium text-right">{value}</div>
        </div>
    );
};

export const ProjectCard: FC<ProjectCardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { getAccessToken } = useAuth();
    const { push } = useNotification();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [_, setIsMobileView] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    const DESKTOP_BREAKPOINT = 992;

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < DESKTOP_BREAKPOINT);

            if (showOptionsMenu && window.innerWidth >= DESKTOP_BREAKPOINT) {
                setShowOptionsMenu(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [showOptionsMenu]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const menu = document.getElementById(`options-menu-${data.id}`);
            const button = document.getElementById(`options-button-${data.id}`);

            if (
                menu &&
                button &&
                !menu.contains(event.target as Node) &&
                !button.contains(event.target as Node)
            ) {
                setShowOptionsMenu(false);
            }
        };

        if (showOptionsMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionsMenu, data.id]);

    const handleWithdraw = async () => {
        const accessToken = getAccessToken();
        if (!accessToken) return;

        try {
            setIsWithdrawing(true);

            await updateProjectStatus(
                accessToken,
                data.id,
                ProjectStatusEnum.Withdrawn
            );

            push({
                message: 'Project withdrawn successfully',
                level: 'success',
            });

            window.location.reload();
            // biome-ignore lint: can't find the specific type for the error thrown by the fetch request
        } catch (error: any) {
            console.error('Failed to withdraw project:', error);
            if (error?.response?.status === 401) {
                push({
                    message: 'Your session has expired. Please sign in again.',
                    level: 'error',
                });
            } else if (error?.response?.status === 403) {
                push({
                    message:
                        'You do not have permission to withdraw this project.',
                    level: 'error',
                });
            } else {
                push({
                    message:
                        'Unable to withdraw your project. Please try again or contact support if the issue persists.',
                    level: 'error',
                });
            }
        } finally {
            setIsWithdrawing(false);
            setShowWithdrawModal(false);
        }
    };

    const canWithdraw =
        data.status === ProjectStatusEnum.Pending ||
        data.status === ProjectStatusEnum.NeedsReview;

    const viewProject = () => {
        if (data.status === 'draft') {
            navigate({
                to: `/user/project/${data.id}/form`,
            });
        } else {
            navigate({
                to: `/user/project/${data.id}/view`,
            });
        }

        setShowOptionsMenu(false);
    };

    return (
        <>
            <Card className="bg-white border-none">
                <div className="flex justify-between items-center">
                    <div className="h-full">
                        <h1
                            className={clsx(
                                'align-bottom h-full text-lg lg:text-xl font-semibold',
                                data.title.toLowerCase().includes('untitled') &&
                                    'italic'
                            )}
                        >
                            {data.title}
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                        {canWithdraw && (
                            <Button
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                                onClick={() => setShowWithdrawModal(true)}
                            >
                                <FiTrash2 className="w-4 h-4" />
                                Withdraw
                            </Button>
                        )}

                        {data.status === 'draft' ? (
                            <Button
                                onClick={() =>
                                    navigate({
                                        to: `/user/project/${data.id}/form`,
                                    })
                                }
                            >
                                Edit Draft Project
                            </Button>
                        ) : (
                            <Button
                                className="bg-gray-800 text-white hover:bg-gray-700"
                                onClick={() =>
                                    navigate({
                                        to: `/user/project/${data.id}/view`,
                                    })
                                }
                            >
                                View
                            </Button>
                        )}
                    </div>

                    <div className="lg:hidden relative">
                        <button
                            type="button"
                            id={`options-button-${data.id}`}
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                        >
                            <FiMoreVertical size={20} />
                        </button>

                        {showOptionsMenu && (
                            <div
                                id={`options-menu-${data.id}`}
                                className="absolute right-0 top-10 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200"
                            >
                                {canWithdraw && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOptionsMenu(false);
                                            setShowWithdrawModal(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                        Withdraw
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={viewProject}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {data.status === 'draft'
                                        ? 'Edit Draft Project'
                                        : 'View'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-[1px] bg-gray-200 my-4" />

                <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4 items-center">
                    <InfoSection label="Company name">
                        {data.companyName || 'N/A'}
                    </InfoSection>

                    <InfoSection label="Status">
                        {(() => {
                            let variant: BadgeProps['variant'] = 'default';
                            let icon: ReactNode = (
                                <FiFileText className="w-4 h-4" />
                            );
                            // Determine variant and icon based on status
                            switch (data.status) {
                                case ProjectStatusEnum.Verified:
                                    variant = 'success';
                                    icon = (
                                        <FiCheckCircle className="w-4 h-4" />
                                    );
                                    break;
                                case ProjectStatusEnum.Declined:
                                    variant = 'error';
                                    icon = <FiXCircle className="w-4 h-4" />;
                                    break;
                                case ProjectStatusEnum.NeedsReview:
                                    variant = 'warning';
                                    // make warning icon slightly larger to match text size
                                    icon = (
                                        <FiAlertCircle className="w-5 h-5" />
                                    );
                                    break;
                                case ProjectStatusEnum.Withdrawn:
                                    variant = 'withdrawn';
                                    icon = <FiSlash className="w-4 h-4" />;
                                    break;
                                default: // Submitted/Pending
                                    variant = 'default';
                                    icon = <FiFileText className="w-4 h-4" />;
                                    break;
                            }
                            return (
                                <Badge
                                    capitalizeText
                                    text={data.status}
                                    variant={variant}
                                    icon={icon}
                                />
                            );
                        })()}
                    </InfoSection>

                    <InfoSection label="Date Submitted">
                        {formatUnixTimestamp(data.updatedAt)}
                    </InfoSection>

                    <InfoSection label="Documents Uploaded">
                        {`${data.documentCount} Documents`}
                    </InfoSection>

                    <InfoSection label="Team Members">
                        {`${data.teamMemberCount} Members`}
                    </InfoSection>
                </div>

                <div className="lg:hidden space-y-4">
                    <MobileInfoRow
                        label="Status"
                        value={
                            <div className="flex justify-end">
                                {(() => {
                                    // Same logic for mobile view
                                    let variant: BadgeProps['variant'] =
                                        'default';
                                    let icon: ReactNode = (
                                        <FiFileText className="w-4 h-4" />
                                    );
                                    switch (data.status) {
                                        case ProjectStatusEnum.Verified:
                                            variant = 'success';
                                            icon = (
                                                <FiCheckCircle className="w-4 h-4" />
                                            );
                                            break;
                                        case ProjectStatusEnum.Declined:
                                            variant = 'error';
                                            icon = (
                                                <FiXCircle className="w-4 h-4" />
                                            );
                                            break;
                                        case ProjectStatusEnum.NeedsReview:
                                            variant = 'warning';
                                            icon = (
                                                <FiAlertCircle className="w-5 h-5" />
                                            );
                                            break;
                                        case ProjectStatusEnum.Withdrawn:
                                            variant = 'withdrawn';
                                            icon = (
                                                <FiSlash className="w-4 h-4" />
                                            );
                                            break;
                                        default:
                                            variant = 'default';
                                            icon = (
                                                <FiFileText className="w-4 h-4" />
                                            );
                                            break;
                                    }
                                    return (
                                        <Badge
                                            text={data.status}
                                            capitalizeText
                                            variant={variant}
                                            icon={icon}
                                        />
                                    );
                                })()}
                            </div>
                        }
                    />

                    <MobileInfoRow
                        label="Date submitted"
                        value={formatUnixTimestamp(data.updatedAt)}
                    />

                    <MobileInfoRow
                        label="Documents uploaded"
                        value={`${data.documentCount} Documents`}
                    />

                    <MobileInfoRow
                        label="Team members"
                        value={`${data.teamMemberCount} Members`}
                    />

                    <div className="pt-2">
                        <Button onClick={viewProject} className="w-full">
                            {data.status === 'draft'
                                ? 'Edit Draft Project'
                                : 'View'}
                        </Button>
                    </div>
                </div>
            </Card>

            <WithdrawProjectModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onConfirm={handleWithdraw}
                isLoading={isWithdrawing}
            />
        </>
    );
};
