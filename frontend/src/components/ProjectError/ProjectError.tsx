import { useState } from 'react';
import {
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
    MdErrorOutline,
    MdChevronLeft,
    MdClose,
} from 'react-icons/md';
import { sanitizeHtmlId } from '@/utils/html';
import type {
    ValidationError,
    ErrorsBySection,
    ProjectErrorProps,
} from '@/types/project';

export const ProjectError: React.FC<ProjectErrorProps> = ({
    errors,
    onErrorClick,
    isOpen = true,
    onToggle,
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set()
    );

    const handleErrorClickWrapper = (
        error: ValidationError,
        e: React.MouseEvent
    ) => {
        e.preventDefault();

        onErrorClick(
            error.section,
            sanitizeHtmlId(error.subsection),
            error.questionId
        );

        if (onToggle) {
            onToggle();
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            newSet.has(section) ? newSet.delete(section) : newSet.add(section);

            return newSet;
        });
    };

    if (errors.length === 0) {
        return null;
    }

    const errorsBySection: ErrorsBySection = errors.reduce((acc, error) => {
        acc[error.section] = acc[error.section] || { count: 0, errors: [] };
        acc[error.section].count += 1;
        acc[error.section].errors.push(error);

        return acc;
    }, {} as ErrorsBySection);

    return (
        <div
            className={`fixed right-0 top-32 z-30 transform-gpu transition-all duration-300 ease-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <button
                onClick={onToggle}
                className={`absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-l-lg border border-red-300 bg-red-50 text-red-600 shadow-lg hover:bg-red-100 transition-all ${
                    isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                type="button"
            >
                <MdChevronLeft className="text-2xl" />
                <span className="absolute -top-2 -left-2 bg-white text-red-500 rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-sm border border-red-200">
                    {errors.length}
                </span>
            </button>

            <div
                className={`w-80 bg-white border border-red-300 rounded-l-lg shadow-xl transition-transform duration-300 overflow-hidden ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="bg-red-50 p-4 border-b border-red-200 flex justify-between items-center rounded-tl-lg">
                    <div className="flex items-center">
                        <MdErrorOutline className="text-red-600 text-xl mr-2" />
                        <div className="text-red-600 text-lg font-semibold">
                            {errors.length} Required Field
                            {errors.length !== 1 ? 's' : ''} Missing
                        </div>
                    </div>

                    <button
                        onClick={onToggle}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                        type="button"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {Object.entries(errorsBySection).map(
                        ([section, { count, errors }]) => (
                            <div key={section} className="mb-4 last:mb-0">
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section)}
                                    className="w-full flex items-center justify-between text-left mb-2 group bg-gray-50 p-2 rounded hover:bg-gray-100"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {section}
                                        </h3>

                                        <p className="text-red-600 text-sm font-medium">
                                            {count} error
                                            {count !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {expandedSections.has(section) ? (
                                        <MdKeyboardArrowUp className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                                    ) : (
                                        <MdKeyboardArrowDown className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                                    )}
                                </button>

                                {expandedSections.has(section) && (
                                    <div className="pl-4 space-y-2">
                                        {errors.map((error, index) => (
                                            <div
                                                key={`error-${error.section}-${error.subsection}-${index}`}
                                                className="border-l-2 border-red-300 pl-3"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleErrorClickWrapper(
                                                            error,
                                                            e
                                                        )
                                                    }
                                                    className="block w-full text-left hover:bg-red-50 p-2 rounded transition-colors"
                                                >
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {error.questionText}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {error.reason} in{' '}
                                                        <span className="font-medium">
                                                            {error.subsection}
                                                        </span>
                                                    </p>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
