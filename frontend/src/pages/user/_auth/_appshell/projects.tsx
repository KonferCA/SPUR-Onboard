import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { ProjectsTable } from '@/components/tables/ProjectsTable'
import { getProjects } from '@/services/project'
import type { Project } from '@/services/project'
import type { SortingState } from '@tanstack/react-table'
import { useAuth } from '@/contexts'

const UserProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<
        'all' | 'in_progress' | 'completed' | 'in_review'
    >('all')
    const [filters, setFilters] = useState({
        industry: '',
        yearFounded: '',
    })
    const [searchQuery, setSearchQuery] = useState('')
    const { accessToken } = useAuth();

    useEffect(() => {
        if (!accessToken) return;

        const fetchProjects = async () => {
            try {
                setIsLoading(true)
                const data = await getProjects(accessToken);

                if (data) {
                    setProjects(data)
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to fetch projects',
                )
            } finally {
                setIsLoading(false)
            }
        }

    fetchProjects()
    }, [accessToken])

    const filteredProjects = projects.filter((project) => {
        // Filter by active tab
        if (
            activeTab !== 'all' && 
            project.status !== activeTab
        ) {
            return false
        } 

        // Filter by industry
        if (
            filters.industry && 
            project.industry !== filters.industry
        ) {
            return false
        }

        // Filter by year founded
        if (filters.yearFounded && 
            project.founded_date?.includes(filters.yearFounded) !== true
        ) {
            return false
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()

            return (
                project.title.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query) ||
                project.status.toLowerCase().includes(query)
            )
        }

        return true
    })

    // Get unique values for filters
    const industries = [...new Set(projects.map((p) => p.industry))]
    const years = [
        ...new Set(
            projects
            .map((p) =>
                p.founded_date ? new Date(p.founded_date).getFullYear() : null,
            )
            .filter((year): year is number => year !== null),
        ),
    ].sort((a, b) => b - a)

    const handleSortingChange = (sorting: SortingState) => {
        // Handle sorting if needed
        console.log('Sorting changed:', sorting)
    }

    if (error) {
        return (
            <>
                <div className="text-red-600">Error: {error}</div>
            </>
        )
    }

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">
                            My Projects
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-4 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'all', name: 'All Projects' },
                            { id: 'in_progress', name: 'In Progress' },
                            { id: 'completed', name: 'Completed' },
                            { id: 'in_review', name: 'In Review' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                                >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Filters */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <select
                        value={filters.industry}
                        onChange={(e) =>
                            setFilters((prev) => ({
                            ...prev,
                            industry: e.target.value,
                            }))
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Industry</option>
                        {industries.map((industry) => (
                            <option key={industry} value={industry || ''}>
                                {industry || 'N/A'}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.yearFounded}
                        onChange={(e) =>
                            setFilters((prev) => ({
                            ...prev,
                            yearFounded: e.target.value,
                            }))
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Year Founded</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search projects"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                {isLoading ? (
                    <div className="mt-6 text-center text-gray-500">
                        Loading projects...
                    </div>
                ) : (
                    <ProjectsTable
                        data={filteredProjects}
                        onSortingChange={handleSortingChange}
                    />
                )}
            </div>
        </>
    )
}

export const Route = createFileRoute('/user/_auth/_appshell/projects')({
    component: UserProjectsPage,
})
