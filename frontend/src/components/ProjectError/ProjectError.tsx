import React, { useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { sanitizeHtmlId } from '@/utils/html';

export interface ValidationError {
    section: string;
    subsection: string;
    questionText: string;
    inputType: string;
    required: boolean;
    value: any;
    reason: string;
}

interface ErrorsBySection {
    [section: string]: {
        count: number;
        errors: ValidationError[];
    };
}

export interface ProjectErrorProps {
    errors: ValidationError[];
    onErrorClick: (section: string, subsectionId: string) => void;
}

export const ProjectError: React.FC<ProjectErrorProps> = ({ errors, onErrorClick }) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    if (errors.length === 0) return null;

    const errorsBySection: ErrorsBySection = errors.reduce((acc, error) => {
        if (!acc[error.section]) {
            acc[error.section] = { 
                count: 0, 
                errors: [] 
            };
        }

        acc[error.section].count += 1;
        acc[error.section].errors.push(error);

        return acc;
    }, {} as ErrorsBySection);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }

            return newSet;
        });
    };

    const handleErrorClick = (error: ValidationError, e: React.MouseEvent) => {
        e.preventDefault();
        onErrorClick(error.section, sanitizeHtmlId(error.subsection));
    };

    return (
        <div className="w-full bg-white border border-dashed border-red-600 rounded-lg overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100">
                <div className="text-red-600 text-lg font-semibold">
                    Oops! You're missing information
                </div>
            </div>

            <div className="p-4 max-h-[calc(50vh-100px)] overflow-y-auto">
                {Object.entries(errorsBySection).map(([section, { count, errors }]) => (
                    <div key={section} className="mb-4 last:mb-0">
                        <button 
                            onClick={() => toggleSection(section)}
                            className="w-full flex items-center justify-between text-left mb-2 group"
                        >
                            <div>
                                <h3 className="font-medium text-gray-900">{section}</h3>
                                <p className="text-gray-600 text-sm">
                                    {count} unfilled required field{count !== 1 ? 's' : ''}
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
                                {errors.map((error, idx) => (
                                    <div key={idx} className="border-l-2 border-red-200 pl-3">
                                        <button
                                            onClick={(e) => handleErrorClick(error, e)}
                                            className="block w-full text-left hover:bg-red-50 p-2 rounded transition-colors"
                                        >
                                            <p className="text-sm font-medium text-gray-900">
                                                {error.questionText}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {error.reason} in {error.subsection}
                                            </p>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <p className="text-sm text-gray-600 mt-4">
                    Please review these sections before submitting. Click on each error to go to the relevant question.
                </p>
            </div>
        </div>
    );
};