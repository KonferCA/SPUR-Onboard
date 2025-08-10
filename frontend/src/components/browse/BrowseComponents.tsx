import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiHeart, FiSearch } from 'react-icons/fi';
import { Link, useLocation } from '@tanstack/react-router';
import { getLatestProjects } from '@/services/project';
import type { ExtendedProjectResponse } from '@/types/project';
import { useQuery } from '@tanstack/react-query';

export interface ProjectCardData {
    id: string;
    name: string;
    company: string;
    description?: string;
    tags: string[];
    fundStage: string;
    fundingRaised?: string;
    status: string;
    liked: boolean;
    createdAt: number;
}

// TODO: move away from localStorage for production
const getLikedProjects = (): Set<string> => {
    try {
        const liked = localStorage.getItem('likedProjects');
        return new Set(liked ? JSON.parse(liked) : []);
    } catch {
        return new Set();
    }
};

export const toggleProjectLike = (projectId: string): boolean => {
    const liked = getLikedProjects();
    if (liked.has(projectId)) {
        liked.delete(projectId);
    } else {
        liked.add(projectId);
    }
    localStorage.setItem('likedProjects', JSON.stringify([...liked]));
    return liked.has(projectId);
};

export const transformProjectData = (
    project: ExtendedProjectResponse
): ProjectCardData => {
    const liked = getLikedProjects();
    // TODO: improve this logic to handle cases where project data might not have all fields
    const fundStages = ['Pre-Seed', 'Seed', 'Series A', 'Series B'];

    // TODO: dunno what these amounts should be, so using some arbitrary values
    const fundingAmounts = [
        '$25,000',
        '$50,000',
        '$75,000',
        '$100,000',
        '$150,000',
        '$250,000',
        '$500,000',
        '$750,000',
        '$1,000,000',
        '$1,500,000',
        '$2,000,000',
    ];

    // Use project id to consistently generate the same "random" data
    const idHash = project.id
        .split('')
        .reduce((a, b) => a + b.charCodeAt(0), 0);
    const stageIndex = idHash % fundStages.length;
    const amountIndex = idHash % fundingAmounts.length;

    // Add some variance to creation dates for better sorting demonstration
    const dayOffset = (idHash % 365) * 24 * 60 * 60; // Random day within a year
    const adjustedCreatedAt = project.createdAt - dayOffset;

    return {
        id: project.id,
        name: project.title || `Project ${project.id.slice(0, 6)}`,
        company: project.companyName || 'Unknown Company',
        description: project.description || undefined,
        tags: project.description
            ? extractTagsFromDescription(project.description)
            : ['Technology'], // Extract from description or default
        fundStage: fundStages[stageIndex],
        fundingRaised: fundingAmounts[amountIndex],
        status: project.status,
        liked: liked.has(project.id),
        createdAt: adjustedCreatedAt,
    };
};

// Helper function to extract tags from description (basic implementation)
const extractTagsFromDescription = (description: string): string[] => {
    const categoryKeywords = {
        'Artificial Intelligence': [
            'ai',
            'artificial intelligence',
            'machine learning',
            'ml',
            'neural',
        ],
        FinTech: [
            'fintech',
            'finance',
            'banking',
            'payment',
            'crypto',
            'blockchain',
        ],
        SaaS: ['saas', 'software', 'platform', 'service'],
        Technology: ['tech', 'technology', 'software', 'app', 'digital'],
        'Health & Fitness': ['health', 'fitness', 'medical', 'healthcare'],
        'E-Commerce': [
            'ecommerce',
            'e-commerce',
            'shopping',
            'retail',
            'marketplace',
        ],
    };

    const lowerDescription = description.toLowerCase();
    const matchedTags: string[] = [];

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        if (keywords.some((keyword) => lowerDescription.includes(keyword))) {
            matchedTags.push(category);
        }
    });

    return matchedTags.length > 0 ? matchedTags.slice(0, 3) : ['Technology'];
};

export const categories = [
    'All Categories',
    'Artificial Intelligence',
    'Business',
    'Design & Creative',
    'E-Commerce & Shopping',
    'Finance / Fintech',
    'Health & Fitness',
    'Platforms',
    'Work & Productivity',
    'Engineering & Development',
    'Travel',
    'Technology',
    'SaaS',
];

export function FilterDropdown({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary-100"
            >
                {value}
                <FiChevronDown className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                type="button"
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ProjectCard({
    project,
    featured = false,
}: { project: ProjectCardData; featured?: boolean }) {
    const [liked, setLiked] = useState(project.liked);
    const location = useLocation();

    // sync liked state when project changes
    useEffect(() => {
        setLiked(project.liked);
    }, [project.liked]);

    const handleLikeToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newLikedState = toggleProjectLike(project.id);
        setLiked(newLikedState);
    };

    // determine navigation path based on current location
    const isAuthenticatedPage = location.pathname.startsWith('/user/');
    const projectPath = isAuthenticatedPage
        ? `/user/project/${project.id}`
        : `/project/${project.id}`;

    return (
        <Link
            to={projectPath}
            className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        >
            <div className="h-48 bg-gray-100 relative">
                <button
                    type="button"
                    onClick={handleLikeToggle}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-50 transition-colors z-10"
                >
                    <FiHeart
                        className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                </button>

                <div className="flex items-center justify-center h-full">
                    <div className="w-16 h-16 bg-gray-900 rounded flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                            {project.name[0]}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                </h3>

                <p className="text-sm text-gray-500 mb-2">{project.company}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag: string, idx: number) => (
                        <span
                            key={`${project.id}-tag-${tag}-${idx}`}
                            className="text-xs text-gray-500"
                        >
                            {tag}
                            {idx < project.tags.length - 1 && ' |'}
                        </span>
                    ))}
                </div>

                {featured && project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                    </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500">Fund Stage</p>
                        <p className="text-sm font-medium">
                            {project.fundStage}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-gray-500">Funding Raised</p>
                        <p className="text-sm font-medium">
                            {featured ? (
                                <>
                                    {project.fundingRaised}{' '}
                                    <span className="text-gray-500">
                                        {project.status}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Raised
                                    <div className="text-gray-500">
                                        {project.fundingRaised} {project.status}
                                    </div>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function useBrowseProjects() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLikedOnly, setShowLikedOnly] = useState(false);
    const [filters, setFilters] = useState({
        fundStage: 'Fund Stage',
        raised: 'Raised',
        founded: 'Founded',
        teamSize: 'Team Size',
        investors: '# of Investors',
        sortBy: 'Sort: Most Recent',
    });

    const {
        data: projectsData = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['browse_projects'],
        queryFn: async () => {
            try {
                return await getLatestProjects();
            } catch (err) {
                console.warn('Failed to fetch projects:', err);
                return [];
            }
        },
        refetchOnWindowFocus: false,
    });

    const allProjectsData = projectsData.map(transformProjectData);

    const filteredProjects = allProjectsData.filter((project) => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();

            if (
                !project.name.toLowerCase().includes(query) &&
                !project.company.toLowerCase().includes(query) &&
                !project.description?.toLowerCase().includes(query)
            ) {
                return false;
            }
        }

        if (selectedCategories.length > 0) {
            const hasMatchingCategory = selectedCategories.some((category) =>
                project.tags.includes(category)
            );

            if (!hasMatchingCategory) {
                return false;
            }
        }

        if (filters.fundStage !== 'Fund Stage') {
            if (project.fundStage !== filters.fundStage) {
                return false;
            }
        }

        if (filters.raised !== 'Raised') {
            const projectAmount = Number.parseInt(
                project.fundingRaised?.replace(/[$,]/g, '') || '0'
            );

            switch (filters.raised) {
                case '< $100k':
                    if (projectAmount >= 100000) return false;
                    break;
                case '$100k - $500k':
                    if (projectAmount < 100000 || projectAmount > 500000)
                        return false;
                    break;
                case '$500k - $1M':
                    if (projectAmount < 500000 || projectAmount > 1000000)
                        return false;
                    break;
                case '> $1M':
                    if (projectAmount <= 1000000) return false;
                    break;
            }
        }

        if (filters.founded !== 'Founded') {
            const projectYear = new Date(
                project.createdAt * 1000
            ).getFullYear();

            const filterYear = Number.parseInt(filters.founded);

            if (projectYear !== filterYear) {
                return false;
            }
        }

        if (filters.teamSize !== 'Team Size') {
            const idHash = project.id
                .split('')
                .reduce((a, b) => a + b.charCodeAt(0), 0);
            const teamSize = (idHash % 50) + 1; // generate 1-50

            switch (filters.teamSize) {
                case '1-10':
                    if (teamSize > 10) return false;
                    break;
                case '11-50':
                    if (teamSize <= 10 || teamSize > 50) return false;
                    break;
                case '51-100':
                    if (teamSize <= 50 || teamSize > 100) return false;
                    break;
                case '100+':
                    if (teamSize <= 100) return false;
                    break;
            }
        }

        // number of investors filter (mock implementation)
        if (filters.investors !== '# of Investors') {
            const idHash = project.id
                .split('')
                .reduce((a, b) => a + b.charCodeAt(0), 0);
            const investorCount = (idHash % 25) + 1; // generate 1-25

            switch (filters.investors) {
                case '0-5':
                    if (investorCount > 5) return false;
                    break;
                case '6-10':
                    if (investorCount <= 5 || investorCount > 10) return false;
                    break;
                case '11-20':
                    if (investorCount <= 10 || investorCount > 20) return false;
                    break;
                case '20+':
                    if (investorCount <= 20) return false;
                    break;
            }
        }

        if (showLikedOnly) {
            if (!project.liked) {
                return false;
            }
        }

        return true;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        const sortOption = filters.sortBy.replace('Sort: ', ''); // remove "Sort: " prefix if present

        switch (sortOption) {
            case 'Most Recent':
                return b.createdAt - a.createdAt;
            case 'Most Funded': {
                const amountA = Number.parseInt(
                    a.fundingRaised?.replace(/[$,]/g, '') || '0'
                );
                const amountB = Number.parseInt(
                    b.fundingRaised?.replace(/[$,]/g, '') || '0'
                );
                return amountB - amountA;
            }
            case 'Most Popular':
                // sort by liked status first, then by creation date
                if (a.liked !== b.liked) {
                    return a.liked ? -1 : 1;
                }
                return b.createdAt - a.createdAt;
            case 'Alphabetical':
                return a.name.localeCompare(b.name);
            default:
                console.warn(
                    'Unknown sort option:',
                    sortOption,
                    'from filters.sortBy:',
                    filters.sortBy
                );
                return b.createdAt - a.createdAt;
        }
    });

    // TODO: featured projects are empty until endpoint is implemented
    const featuredProjects: ProjectCardData[] = [];

    // all projects go to the "All Projects" section
    const remainingProjects = sortedProjects;

    const handleFilterChange = (
        filterKey: keyof typeof filters,
        value: string
    ) => {
        setFilters((prev) => ({ ...prev, [filterKey]: value }));
    };

    const addCategory = (category: string) => {
        if (
            category !== 'All Categories' &&
            !selectedCategories.includes(category)
        ) {
            setSelectedCategories((prev) => [...prev, category]);
        }
    };

    const removeCategory = (categoryToRemove: string) => {
        setSelectedCategories((prev) =>
            prev.filter((cat) => cat !== categoryToRemove)
        );
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setShowLikedOnly(false);
        setFilters({
            fundStage: 'Fund Stage',
            raised: 'Raised',
            founded: 'Founded',
            teamSize: 'Team Size',
            investors: '# of Investors',
            sortBy: 'Sort: Most Recent',
        });
        setSearchQuery('');
    };

    // debug logging for sort changes and data loading
    useEffect(() => {
        console.log('Sort changed to:', filters.sortBy);
        if (sortedProjects.length > 0) {
            console.log(
                'First 3 projects after sorting:',
                sortedProjects.slice(0, 3).map((p) => ({
                    name: p.name,
                    fundingRaised: p.fundingRaised,
                    createdAt: new Date(p.createdAt * 1000).toDateString(),
                    liked: p.liked,
                }))
            );
        }
    }, [filters.sortBy, sortedProjects]);

    // debug logging for data loading
    useEffect(() => {
        console.log('Projects data loaded:', {
            isLoading,
            error,
            projectsCount: projectsData.length,
            transformedCount: allProjectsData.length,
            filteredCount: filteredProjects.length,
            sortedCount: sortedProjects.length,
        });
    }, [
        isLoading,
        error,
        projectsData,
        allProjectsData,
        filteredProjects,
        sortedProjects,
    ]);

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.fundStage !== 'Fund Stage') count++;
        if (filters.raised !== 'Raised') count++;
        if (filters.founded !== 'Founded') count++;
        if (filters.teamSize !== 'Team Size') count++;
        if (filters.investors !== '# of Investors') count++;
        if (selectedCategories.length > 0) count += selectedCategories.length;
        if (showLikedOnly) count++;

        return count;
    };

    if (error) {
        console.error('Error fetching projects:', error);
    }

    return {
        selectedCategories,
        addCategory,
        removeCategory,
        searchQuery,
        setSearchQuery,
        showLikedOnly,
        setShowLikedOnly,
        filters,
        handleFilterChange,
        resetFilters,
        featuredProjects,
        remainingProjects,
        isLoading,
        error,
        activeFilterCount: getActiveFilterCount(),
    };
}

export function SearchHeader({
    searchQuery,
    setSearchQuery,
}: { searchQuery: string; setSearchQuery: (query: string) => void }) {
    return (
        <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
                type="text"
                placeholder="Search Projects, Companies, Founders"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-button-primary-100 focus:border-transparent"
            />
        </div>
    );
}
