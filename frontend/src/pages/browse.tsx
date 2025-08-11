import { createFileRoute } from '@tanstack/react-router';
import { usePageTitle } from '@/utils';
import { FiHeart, FiX, FiRefreshCw } from 'react-icons/fi';
import { LogoSVG } from '@/assets';
import {
    useBrowseProjects,
    ProjectCard,
    FilterDropdown,
    SearchHeader,
    categories,
} from '@/components/browse/BrowseComponents';

export const Route = createFileRoute('/browse')({
    component: BrowseProjects,
});

function BrowseProjects() {
    usePageTitle('Browse Projects');

    const {
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
        activeFilterCount,
    } = useBrowseProjects();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center">
                                <img
                                    src={LogoSVG}
                                    alt="SPUR"
                                    className="w-10 h-10"
                                />
                                <span className="ml-2 text-xl font-bold tracking-wider">
                                    ONBOARD
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <SearchHeader
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                            />
                            <button
                                type="button"
                                onClick={() => setShowLikedOnly(!showLikedOnly)}
                                className={`flex items-center gap-2 text-sm transition-colors ${
                                    showLikedOnly
                                        ? 'text-button-primary-100 hover:text-button-primary-200'
                                        : 'text-gray-700 hover:text-gray-900'
                                }`}
                            >
                                <FiHeart
                                    className={`w-5 h-5 ${showLikedOnly ? 'fill-red-500 text-red-500' : ''}`}
                                />
                                {showLikedOnly
                                    ? 'Show All Projects'
                                    : 'Liked Projects'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-lg text-gray-600">
                            Loading projects...
                        </div>
                    </div>
                )}

                {!isLoading && featuredProjects.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">
                            Featured Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    featured={true}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold mb-6">All Projects</h2>

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-button-primary-100 rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </span>

                            <FilterDropdown
                                label="Fund Stage"
                                options={[
                                    'Fund Stage',
                                    'Pre-Seed',
                                    'Seed',
                                    'Series A',
                                    'Series B',
                                ]}
                                value={filters.fundStage}
                                onChange={(value) =>
                                    handleFilterChange('fundStage', value)
                                }
                            />
                            <FilterDropdown
                                label="Raised"
                                options={[
                                    'Raised',
                                    '< $100k',
                                    '$100k - $500k',
                                    '$500k - $1M',
                                    '> $1M',
                                ]}
                                value={filters.raised}
                                onChange={(value) =>
                                    handleFilterChange('raised', value)
                                }
                            />
                            <FilterDropdown
                                label="Founded"
                                options={[
                                    'Founded',
                                    '2024',
                                    '2023',
                                    '2022',
                                    '2021',
                                    '2020',
                                ]}
                                value={filters.founded}
                                onChange={(value) =>
                                    handleFilterChange('founded', value)
                                }
                            />
                            <FilterDropdown
                                label="Team Size"
                                options={[
                                    'Team Size',
                                    '1-10',
                                    '11-50',
                                    '51-100',
                                    '100+',
                                ]}
                                value={filters.teamSize}
                                onChange={(value) =>
                                    handleFilterChange('teamSize', value)
                                }
                            />
                            <FilterDropdown
                                label="# of Investors"
                                options={[
                                    '# of Investors',
                                    '0-5',
                                    '6-10',
                                    '11-20',
                                    '20+',
                                ]}
                                value={filters.investors}
                                onChange={(value) =>
                                    handleFilterChange('investors', value)
                                }
                            />
                            <div className="ml-auto">
                                <FilterDropdown
                                    label="Sort: Most Recent"
                                    options={[
                                        'Sort: Most Recent',
                                        'Most Recent',
                                        'Most Funded',
                                        'Most Popular',
                                        'Alphabetical',
                                    ]}
                                    value={filters.sortBy}
                                    onChange={(value) =>
                                        handleFilterChange('sortBy', value)
                                    }
                                />
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <FiRefreshCw className="w-4 h-4" />
                                    Reset Filters
                                </button>
                            )}
                        </div>

                        {selectedCategories.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Selected Categories:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map((category) => (
                                        <span
                                            key={category}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-button-primary-25 text-button-primary-text-100 border border-button-primary-100 rounded-full"
                                        >
                                            {category}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeCategory(category)
                                                }
                                                className="ml-1 p-0.5 hover:bg-button-primary-50 rounded-full transition-colors"
                                                title={`Remove ${category}`}
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                Browse by category
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {categories
                                    .filter(
                                        (category) =>
                                            category !== 'All Categories'
                                    )
                                    .map((category) => (
                                        <button
                                            type="button"
                                            key={category}
                                            onClick={() =>
                                                addCategory(category)
                                            }
                                            disabled={selectedCategories.includes(
                                                category
                                            )}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                                selectedCategories.includes(
                                                    category
                                                )
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {!isLoading && (
                        <div>
                            {remainingProjects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {remainingProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-lg text-gray-600 mb-2">
                                        {searchQuery
                                            ? 'No projects found matching your search.'
                                            : 'No projects available.'}
                                    </div>
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="text-button-primary-100 hover:text-button-primary-200"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
