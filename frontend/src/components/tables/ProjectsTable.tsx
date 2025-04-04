import type React from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
} from '@tanstack/react-table';
import type { Project } from '@/types/project';
import { format, isValid, parseISO } from 'date-fns';
import { ProjectStatusEnum } from '@/services/projects';
import { useAuth } from '@/contexts/AuthContext';
import { FiSearch } from 'react-icons/fi';

const columnHelper = createColumnHelper<Project>();

const STATUS_MAPPING = {
    draft: null,
    pending: 'submitted',
    verified: 'approved',
    declined: 'rejected',
    withdrawn: 'withdrew',
    needsReview: 'needs review',
} as const;

const StatusButton = ({
    label,
    isActive,
    onClick,
}: {
    label: string;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-6 py-3 text-sm font-medium transition-colors
            ${
                isActive
                    ? 'bg-[#F4802F] text-white rounded-lg'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
    >
        {label}
    </button>
);

const FilterDropdown = ({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}) => (
    <div className="flex flex-col gap-1">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all duration-300"
        >
            <option value="">{label}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
            ))}
        </select>
    </div>
);

const SearchInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) => (
    <div className="relative rounded-lg max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <FiSearch className="w-5 h-5" />
        </span>

        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search Projects"
            className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm transition-all duration-300"
        />
    </div>
);

// Helper function to safely format dates
const formatDate = (
    dateString: string | undefined | null,
    formatStr: string
): string => {
    if (!dateString) return 'N/A';
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return 'Invalid date';
        return format(date, formatStr);
    } catch (error) {
        return 'Invalid date';
    }
};

const columns = [
    columnHelper.accessor('title', {
        header: 'Project name',
        cell: (info) => (
            <div className="flex flex-col w-32">
                <div className="font-medium truncate">{info.getValue()}</div>
                {info.row.original.description && (
                    <div className="text-sm text-gray-500 truncate">
                        {info.row.original.description}
                    </div>
                )}
            </div>
        ),
    }),
    columnHelper.accessor('industry', {
        header: 'Industry',
        cell: (info) => (
            <div className="truncate">{info.getValue() || 'N/A'}</div>
        ),
    }),
    columnHelper.accessor('company_stage', {
        header: 'Company Stage',
        cell: (info) => (
            <div className="truncate">
                {info.getValue()?.replace('_', ' ') || 'N/A'}
            </div>
        ),
    }),
    columnHelper.accessor('founded_date', {
        header: 'Year Founded',
        cell: (info) => (
            <div className="truncate">
                {formatDate(info.getValue(), 'yyyy')}
            </div>
        ),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const mappedStatus =
                STATUS_MAPPING[info.getValue() as keyof typeof STATUS_MAPPING];
            if (!mappedStatus) return null;

            return (
                <div>
                    <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${
                            mappedStatus === 'submitted'
                                ? 'bg-gray-100 text-gray-800'
                                : mappedStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : mappedStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : mappedStatus === 'needs review'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {mappedStatus.replace('_', ' ')}
                    </span>
                </div>
            );
        },
    }),
    columnHelper.accessor('created_at', {
        header: 'Date submitted',
        cell: (info) => (
            <div className="w-24 truncate">
                {formatDate(info.getValue(), 'MMM d, yyyy')}
            </div>
        ),
    }),
    columnHelper.accessor('updated_at', {
        header: 'Last updated',
        cell: (info) => (
            <div className="w-32 truncate">
                {formatDate(info.getValue(), 'MMM d, yyyy')}
            </div>
        ),
    }),
];

interface ProjectsTableProps {
    data: Project[];
    onSortingChange?: (sorting: SortingState) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
    data,
    onSortingChange,
}) => {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('submitted');
    const [filters, setFilters] = useState({
        company_stage: '',
        industry: '',
        status: '',
        year: '',
    });

    const { user } = useAuth();

    const isAdmin = useMemo(() => {
        return user?.permissions === 1346;
    }, [user]);

    const statusOptions = [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Approved', value: 'approved' },
        { label: 'Withdrew', value: 'withdrew' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Needs Review', value: 'needs review' },
    ];

    const filterOptions = useMemo(
        () => ({
            company_stage: [],
            industry: [],
            status: [],
            year: [],
        }),
        []
    );

    const filteredData = useMemo(() => {
        const mapStatus = (status: string) => {
            switch (status) {
                case ProjectStatusEnum.Pending:
                    return 'submitted';
                default:
                    return status;
            }
        };

        return data.filter((item) => {
            return selectedStatus === mapStatus(item.status);
        });
    }, [data, selectedStatus]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: (updates) => {
            const nextSorting =
                typeof updates === 'function' ? updates(sorting) : updates;
            setSorting(nextSorting);
            onSortingChange?.(nextSorting);
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handleRowClick = (projectId: string) => {
        navigate({ to: `/user/projects/${projectId}/view` });
    };

    return (
        <div className="p-6 space-y-4 bg-gray-50">
            {!isAdmin && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {statusOptions.map((status) => (
                        <StatusButton
                            key={status.value}
                            label={status.label}
                            isActive={selectedStatus === status.value}
                            onClick={() => setSelectedStatus(status.value)}
                        />
                    ))}

                    <div className="flex-grow" />

                    <SearchInput
                        value={globalFilter}
                        onChange={setGlobalFilter}
                    />
                </div>
            )}

            {isAdmin && (
                <div className="flex flex-wrap gap-4 items-center mb-6">
                    <div className="text-sm font-medium text-gray-700">
                        Filters
                    </div>

                    <FilterDropdown
                        label="Stage"
                        options={filterOptions.company_stage}
                        value={filters.company_stage}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                company_stage: value,
                            }))
                        }
                    />
                    <FilterDropdown
                        label="Industry"
                        options={filterOptions.industry}
                        value={filters.industry}
                        onChange={(value) =>
                            setFilters((prev) => ({ ...prev, industry: value }))
                        }
                    />
                    <FilterDropdown
                        label="Year Founded"
                        options={filterOptions.year}
                        value={filters.year}
                        onChange={(value) =>
                            setFilters((prev) => ({ ...prev, year: value }))
                        }
                    />
                    <FilterDropdown
                        label="Date submitted"
                        options={filterOptions.status}
                        value={filters.status}
                        onChange={(value) =>
                            setFilters((prev) => ({ ...prev, status: value }))
                        }
                    />
                </div>
            )}

            <div className="border-t border-gray-200 my-6" />

            <div>
                <div className="overflow-x-auto">
                    <div className="inline-block w-full align-middle">
                        <div className="overflow-hidden">
                            <table className="w-full table-fixed divide-y divide-gray-200">
                                <thead>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <th
                                                            key={header.id}
                                                            className="py-4 px-4 text-left text-sm font-medium text-gray-600"
                                                            onKeyUp={header.column.getToggleSortingHandler()}
                                                            onClick={header.column.getToggleSortingHandler()}
                                                            style={{
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {flexRender(
                                                                    header
                                                                        .column
                                                                        .columnDef
                                                                        .header,
                                                                    header.getContext()
                                                                )}
                                                                {header.column.getIsSorted() && (
                                                                    <span className="text-gray-400">
                                                                        {header.column.getIsSorted() ===
                                                                        'asc'
                                                                            ? '↑'
                                                                            : '↓'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        ))}
                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={columns.length}
                                                className="py-10 px-4 text-center text-gray-500"
                                            >
                                                No projects found
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-[rgba(255,194,152,0.15)] cursor-pointer border-b border-gray-200 transition-colors duration-300"
                                                onKeyUp={() =>
                                                    handleRowClick(
                                                        row.original.id
                                                    )
                                                }
                                                onClick={() =>
                                                    handleRowClick(
                                                        row.original.id
                                                    )
                                                }
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <td
                                                            key={cell.id}
                                                            className="whitespace-nowrap py-5 px-4 text-sm text-gray-700"
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            )}
                                                        </td>
                                                    ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
