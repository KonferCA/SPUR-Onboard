import React, { useState } from 'react';
import {
    FaChevronLeft,
    FaChevronRight,
    FaGlobe,
    FaLinkedin,
} from 'react-icons/fa';
import { FiHeart, FiShare2, FiUsers } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import type { ProjectCardData } from '@/components/browse/BrowseComponents';

// TODO: grab images from API : mock data for now
const generateCarouselImages = (projectId: string) => [
    {
        id: 1,
        url: `https://picsum.photos/800/400?random=${projectId}1`,
        alt: 'Project Dashboard',
    },
    {
        id: 2,
        url: `https://picsum.photos/800/400?random=${projectId}2`,
        alt: 'Analytics View',
    },
    {
        id: 3,
        url: `https://picsum.photos/800/400?random=${projectId}3`,
        alt: 'Team Collaboration',
    },
    {
        id: 4,
        url: `https://picsum.photos/800/400?random=${projectId}4`,
        alt: 'Project Overview',
    },
];

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
    const carouselImages = generateCarouselImages(project.id);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
        );
    };

    const currentImage = carouselImages[currentSlide];

    // generate mock company details based on project data
    const idHash = project.id
        .split('')
        .reduce((a, b) => a + b.charCodeAt(0), 0);
    const foundedYear = 2020 + (idHash % 4); // 2020-2023
    const teamSize = 2 + (idHash % 20); // 2-21 people
    const totalInvestors = idHash % 10; // 0-9 investors
    const maxInvestors = totalInvestors + 3 + (idHash % 5); // max investors

    // generate valuation
    const valuationAmounts = [
        '$500,000',
        '$1,000,000',
        '$2,500,000',
        '$5,000,000',
    ];

    const valuation = valuationAmounts[idHash % valuationAmounts.length];

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
                            <img
                                src={currentImage.url}
                                alt={currentImage.alt}
                                className="w-full h-full object-cover"
                            />
                        </div>

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
                            {carouselImages.map((image, idx) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentSlide
                                            ? 'bg-gray-800 w-6'
                                            : 'bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">
                            About {project.name}
                        </h2>

                        <div className="space-y-4 text-gray-600">
                            {/* DUMMY DESC */}
                            <p>
                                {project.description ||
                                    `${project.name} is an innovative platform that revolutionizes the way teams collaborate and manage projects. Our cutting-edge solution combines artificial intelligence with intuitive design to deliver exceptional user experiences.`}
                            </p>
                            {/* TODO: pull this content from the project description */}
                            <p>
                                We're passionate about building tools that
                                empower teams to achieve more together. Our
                                platform offers advanced analytics, seamless
                                integrations, and enterprise-grade security to
                                help businesses scale efficiently while
                                maintaining the highest standards of quality.
                            </p>
                            <p>
                                Join thousands of satisfied customers who have
                                transformed their workflow with {project.name}.
                                Experience the future of productivity and
                                collaboration today.
                            </p>
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
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Fund Stage
                                    </span>
                                    <span className="text-sm font-medium">
                                        {project.fundStage}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Total Raised
                                    </span>
                                    <span className="text-sm font-medium text-green-600">
                                        {project.fundingRaised} {project.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Valuation
                                    </span>
                                    <span className="text-sm font-medium text-green-600">
                                        {valuation}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Company details
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Founded
                                    </span>
                                    <span className="text-sm font-medium">
                                        {foundedYear}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Team Size
                                    </span>
                                    <span className="text-sm font-medium">
                                        {teamSize}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Total Investors
                                    </span>
                                    <span className="text-sm font-medium">
                                        {totalInvestors} / {maxInvestors}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* TODO: create modal popup for team details */}
                        <button
                            type="button"
                            className="w-full py-2.5 border-2 border-button-primary-100 text-button-primary-100 rounded-lg font-medium hover:bg-button-primary-25 transition-colors flex items-center justify-center gap-2"
                        >
                            <FiUsers className="w-5 h-5" />
                            Meet the Team
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
