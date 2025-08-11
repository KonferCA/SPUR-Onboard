import React, { useState } from 'react';
import {
    FaChevronLeft,
    FaChevronRight,
    FaGlobe,
    FaLinkedin,
} from 'react-icons/fa';
import { FiHeart, FiShare2, FiUsers, FiX } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import type { ProjectCardData } from '@/components/browse/BrowseComponents';
import { getProjectTeam, getProjectAnswers } from '@/services/project';
import { getProjectDocuments } from '@/services/projects';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts';

interface ProjectAnswer {
    question: string;
    answer: string;
}

interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    socialLinks?: Array<{
        platform: string;
        urlOrHandle: string;
    }>;
    personalWebsite?: string;
    isAccountOwner: boolean;
    commitmentType: string;
    introduction: string;
    industryExperience: string;
    detailedBiography: string;
    previousWork?: string;
    resumeExternalUrl?: string;
    resumeInternalUrl?: string;
    createdAt: number;
    updatedAt: number;
}

interface ProjectDetailContentProps {
    project: ProjectCardData;
    onLike?: () => void;
    onShare?: () => void;
    isLiked?: boolean;
    showActionButtons?: boolean;
}

export function ProjectDetailContent({
    project,
    onLike,
    onShare,
    isLiked = false,
    showActionButtons = true,
}: ProjectDetailContentProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showTeamModal, setShowTeamModal] = useState(false);

    const { getAccessToken } = useAuth();
    const accessToken = getAccessToken();

    const { data: documentsData } = useQuery({
        queryKey: ['project_documents', project.id],
        queryFn: async () => {
            try {
                if (!accessToken) {
                    return null;
                }

                return await getProjectDocuments(accessToken, project.id);
            } catch (err) {
                console.warn('Failed to fetch project documents:', err);

                return null;
            }
        },
        refetchOnWindowFocus: false,
        enabled: !!accessToken,
    });

    const projectImages =
        documentsData?.documents?.filter(
            (doc) =>
                doc.url &&
                (doc.url.toLowerCase().includes('.jpg') ||
                    doc.url.toLowerCase().includes('.jpeg') ||
                    doc.url.toLowerCase().includes('.png'))
        ) || [];

    const carouselImages = projectImages.map((doc, index) => ({
        id: index + 1,
        url: doc.url,
        alt: doc.name || `Project Image ${index + 1}`,
    }));

    const { data: teamData, isLoading: teamLoading } = useQuery({
        queryKey: ['project_team', project.id],
        queryFn: async () => {
            return await getProjectTeam(project.id, accessToken || undefined);
        },
        refetchOnWindowFocus: false,
    });

    const { data: projectAnswers } = useQuery({
        queryKey: ['project_answers', project.id],
        queryFn: async () => {
            try {
                if (!accessToken) {
                    return [];
                }
                return await getProjectAnswers(project.id, accessToken);
            } catch (err) {
                console.warn('Failed to fetch project answers:', err);
                return [];
            }
        },
        refetchOnWindowFocus: false,
        enabled: !!accessToken,
    });

    const teamMembers = teamData?.teamMembers || [];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
        );
    };

    const currentImage =
        carouselImages.length > 0 ? carouselImages[currentSlide] : null;

    const getAnswerByKey = (key: string) => {
        return projectAnswers?.find((answer: ProjectAnswer) =>
            answer.question?.includes(key)
        )?.answer;
    };

    const teamSize = teamMembers?.length || 0;

    const foundingDateAnswer =
        getAnswerByKey('founding') || getAnswerByKey('founded');
    const foundedYear = foundingDateAnswer
        ? new Date(foundingDateAnswer).getFullYear()
        : null;

    const industries =
        getAnswerByKey('industry') || getAnswerByKey('industries');
    const companyMission = getAnswerByKey('mission') || project.description;
    const fundingStage = project.fundStage || getAnswerByKey('funding');
    const valuation = getAnswerByKey('valuation');
    const totalInvestors = getAnswerByKey('investors');
    const maxInvestors = getAnswerByKey('max_investors');

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{project.company}</span>

                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        {project.tags.map((tag, index) => (
                            <React.Fragment key={tag}>
                                <span>{tag}</span>
                                {index < project.tags.length - 1 && (
                                    <span>|</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                        <div className="relative h-96 bg-gray-100">
                            {carouselImages.length > 0 && currentImage ? (
                                <>
                                    <img
                                        src={currentImage.url}
                                        alt={currentImage.alt}
                                        className="w-full h-full object-cover"
                                    />

                                    {carouselImages.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={prevSlide}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                            >
                                                <FaChevronLeft className="w-5 h-5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={nextSlide}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                            >
                                                <FaChevronRight className="w-5 h-5" />
                                            </button>

                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                                {carouselImages.map(
                                                    (image, idx) => (
                                                        <button
                                                            key={image.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setCurrentSlide(
                                                                    idx
                                                                )
                                                            }
                                                            className={`w-2 h-2 rounded-full transition-all ${
                                                                idx ===
                                                                currentSlide
                                                                    ? 'bg-gray-800 w-6'
                                                                    : 'bg-gray-400'
                                                            }`}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <p className="text-gray-500 text-lg">
                                            No images to show
                                        </p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            This project has not uploaded any
                                            featured images
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">
                            About {project.name}
                        </h2>

                        <div className="space-y-4 text-gray-600">
                            {companyMission && <p>{companyMission}</p>}

                            {industries && (
                                <p>
                                    <strong>Industry:</strong> {industries}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {showActionButtons && (
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={onLike}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FiHeart
                                    className={`w-5 h-5 ${
                                        isLiked
                                            ? 'fill-red-500 text-red-500'
                                            : ''
                                    }`}
                                />
                                Like
                            </button>

                            <button
                                type="button"
                                onClick={onShare}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FiShare2 className="w-5 h-5" />
                                Share
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Company Profile
                        </h3>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
                                <span className="text-white text-xl font-bold">
                                    {project.name[0]}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg">
                                    {project.company}
                                </h4>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-3">
                                External profiles
                            </p>

                            {/* TODO: ADD ACTUAL URLS */}
                            <div className="space-y-2">
                                <a
                                    href={`https://${project.company.toLowerCase().replace(/\s+/g, '')}.com`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                                >
                                    <FaGlobe className="w-4 h-4" />
                                    {project.company
                                        .toLowerCase()
                                        .replace(/\s+/g, '')}
                                    .com
                                </a>

                                <a
                                    href={project.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                                >
                                    <FaLinkedin className="w-4 h-4" />
                                    {project.company} on LinkedIn
                                </a>

                                <a
                                    href={project.twitterUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                                >
                                    <RiTwitterXLine className="w-4 h-4" />@
                                    {project.company
                                        .toLowerCase()
                                        .replace(/\s+/g, '')}
                                </a>
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Funding details
                            </h4>
                            <div className="space-y-3">
                                {fundingStage && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Fund Stage
                                        </span>
                                        <span className="text-sm font-medium">
                                            {fundingStage}
                                        </span>
                                    </div>
                                )}
                                {project.fundingRaised && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Total Raised
                                        </span>
                                        <span className="text-sm font-medium text-green-600">
                                            {project.fundingRaised}
                                        </span>
                                    </div>
                                )}
                                {valuation && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Valuation
                                        </span>
                                        <span className="text-sm font-medium text-green-600">
                                            {valuation}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Company details
                            </h4>
                            <div className="space-y-3">
                                {foundedYear && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Founded
                                        </span>
                                        <span className="text-sm font-medium">
                                            {foundedYear}
                                        </span>
                                    </div>
                                )}
                                {teamSize > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Team Size
                                        </span>
                                        <span className="text-sm font-medium">
                                            {teamSize}
                                        </span>
                                    </div>
                                )}
                                {totalInvestors && maxInvestors && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">
                                            Total Investors
                                        </span>
                                        <span className="text-sm font-medium">
                                            {totalInvestors} / {maxInvestors}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowTeamModal(true)}
                            className="w-full py-2.5 border-2 border-button-primary-100 text-button-primary-100 rounded-lg font-medium hover:bg-button-primary-25 transition-colors flex items-center justify-center gap-2"
                        >
                            <FiUsers className="w-5 h-5" />
                            Meet the Team
                        </button>
                    </div>
                </div>
            </div>

            {showTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setShowTeamModal(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setShowTeamModal(false);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                    />

                    <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Meet the Team
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowTeamModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {teamLoading && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">
                                        Loading team members...
                                    </p>
                                </div>
                            )}

                            {!teamLoading && teamMembers.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">
                                        No team members found
                                    </p>
                                </div>
                            )}

                            {!teamLoading && teamMembers.length > 0 && (
                                <div className="space-y-6">
                                    {teamMembers.map((member: TeamMember) => {
                                        const name =
                                            `${member.firstName || ''} ${member.lastName || ''}`.trim();
                                        const avatar = `https://i.pravatar.cc/150?u=${member.id}`;

                                        const linkedinUrl =
                                            member.socialLinks?.find(
                                                (link) =>
                                                    link.platform === 'linkedin'
                                            )?.urlOrHandle;
                                        const twitterUrl =
                                            member.socialLinks?.find(
                                                (link) =>
                                                    link.platform === 'twitter'
                                            )?.urlOrHandle;

                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={avatar}
                                                        alt={name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {member.title}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {linkedinUrl && (
                                                        <a
                                                            href={linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-600 hover:text-blue-600 transition-colors"
                                                        >
                                                            <FaLinkedin className="w-5 h-5" />
                                                        </a>
                                                    )}

                                                    {twitterUrl && (
                                                        <a
                                                            href={twitterUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-600 hover:text-blue-400 transition-colors"
                                                        >
                                                            <RiTwitterXLine className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
