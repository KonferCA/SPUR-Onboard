import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from '@tanstack/react-table';
import type { Project } from '@/services/project';
import { format, isValid, parseISO } from 'date-fns';

const columnHelper = createColumnHelper<Project>();

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null, formatStr: string): string => {
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
    cell: info => (
      <div>
        <div className="font-medium">{info.getValue()}</div>
        {info.row.original.description && (
          <div className="text-sm text-gray-500">{info.row.original.description}</div>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('industry', {
    header: 'Industry',
    cell: info => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('company_stage', {
    header: 'Company Stage',
    cell: info => info.getValue()?.replace('_', ' ') || 'N/A',
  }),
  columnHelper.accessor('founded_date', {
    header: 'Year Founded',
    cell: info => formatDate(info.getValue(), 'yyyy'),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
        ${info.getValue() === 'in_review' ? 'bg-yellow-100 text-yellow-800' : 
          info.getValue() === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          info.getValue() === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'}`}
      >
        {info.getValue().replace('_', ' ')}
      </span>
    ),
  }),
  columnHelper.accessor('created_at', {
    header: 'Date submitted',
    cell: info => formatDate(info.getValue(), 'MMM d, yyyy'),
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last updated',
    cell: info => formatDate(info.getValue(), 'MMM d, yyyy'),
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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: updates => {
      const nextSorting = typeof updates === 'function' ? updates(sorting) : updates;
      setSorting(nextSorting);
      onSortingChange?.(nextSorting);
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleRowClick = (projectId: string) => {
    navigate(`/admin/projects/${projectId}`);
  };

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap py-4 px-3 text-sm text-gray-500"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 