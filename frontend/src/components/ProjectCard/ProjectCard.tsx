import { ExtendedProjectResponse } from '@/services/project';
import { formatUnixTimestamp } from '@/utils/date';
import { Badge, Button, Card } from '@components';
import { ReactNode, useNavigate } from '@tanstack/react-router';
import { FC, useState } from 'react';
import { ProjectStatusEnum, updateProjectStatus } from '@/services/projects';
import { WithdrawProjectModal } from '../WithdrawProjectModal/WithdrawProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

export interface ProjectCardProps {
    data: ExtendedProjectResponse;
}

export const ProjectCard: FC<ProjectCardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const { push } = useNotification();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleWithdraw = async () => {
        if (!accessToken) return;
        
        try {
            setIsWithdrawing(true);
            await updateProjectStatus(accessToken, data.id, ProjectStatusEnum.Withdrawn);
            push({
                message: 'Project withdrawn successfully',
                level: 'success',
            });
            window.location.reload();
        } catch (error) {
            console.error('Failed to withdraw project:', error);
            push({
                message: 'Failed to withdraw project',
                level: 'error',
            });
        } finally {
            setIsWithdrawing(false);
            setShowWithdrawModal(false);
        }
    };

    const canWithdraw = data.status === ProjectStatusEnum.Pending;

    return (
        <>
            <Card>
                <div className="flex justify-between items-center">
                    <div className="h-full">
                        <h1 className="align-bottom h-full">{data.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {canWithdraw && (
                            <Button 
                                variant="outline"
                                onClick={() => setShowWithdrawModal(true)}
                            >
                                Withdraw
                            </Button>
                        )}
                        {data.status === 'draft' && (
                            <Button
                                onClick={() =>
                                    navigate({
                                        to: `/user/project/${data.id}/form`,
                                    })
                                }
                            >
                                Edit Draft Project
                            </Button>
                        )}
                        {data.status !== 'draft' && (
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
                </div>
                <div className="h-[1px] bg-gray-300 my-4"></div>
                <div className="flex items-center justify-between">
                    <InfoSection label="Company Name">
                        {data.companyName}
                    </InfoSection>
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

interface InfoSectionProps {
    label: string;
    children: ReactNode;
}

const InfoSection: FC<InfoSectionProps> = ({ label, children }) => {
    return (
        <div className="flex flex-col items-start gap-3">
            <p className="text-gray-400">{label}</p>
            <div>{children}</div>
        </div>
    );
};
