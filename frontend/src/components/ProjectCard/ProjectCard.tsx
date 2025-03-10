import type { ExtendedProjectResponse } from '@/services/project';
import { formatUnixTimestamp } from '@/utils/date';
import { Badge, Button, Card } from '@components';
import { type ReactNode, useNavigate } from '@tanstack/react-router';
import { type FC, useState, useEffect } from 'react';
import { ProjectStatusEnum, updateProjectStatus } from '@/services/projects';
import { WithdrawProjectModal } from '../WithdrawProjectModal/WithdrawProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { FiMoreVertical } from 'react-icons/fi';
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
        <div className="flex flex-col items-start gap-3">
            <p className="text-gray-400">{label}</p>
            <div>{children}</div>
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
    const { accessToken } = useAuth();
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

    const canWithdraw = data.status === ProjectStatusEnum.Pending;

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
            <Card>
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
                                onClick={() => setShowWithdrawModal(true)}
                            >
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
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
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

                <div className="h-[1px] bg-gray-300 my-4" />

                <div className="hidden lg:flex items-center justify-between">
                    <InfoSection label="Status">
                        <Badge text={data.status} />
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
                                <Badge text={data.status} />
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
