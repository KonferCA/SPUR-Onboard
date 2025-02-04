import { ExtendedProjectResponse } from '@/services/project';
import { formatUnixTimestamp } from '@/utils/date';
import { Badge, Button, Card } from '@components';
import { ReactNode } from '@tanstack/react-router';
import { FC } from 'react';

export interface ProjectCardProps {
    data: ExtendedProjectResponse;
}

export const ProjectCard: FC<ProjectCardProps> = ({ data }) => {
    return (
        <Card>
            <div className="flex justify-between items-center">
                <div className="h-full">
                    <h1 className="align-bottom h-full">{data.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* TODO: add this in post MVP */}
                    {/* <Button variant="outline">Withdraw</Button> */}
                    {data.status === 'draft' && (
                        <Button>Finish Submission</Button>
                    )}
                    {data.status !== 'draft' && <Button>View</Button>}
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
