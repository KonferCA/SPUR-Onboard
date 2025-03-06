import React, { useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { sanitizeHtmlId } from '@/utils/html';

export interface RecommendedField {
    section: string;
    subsection: string;
    questionText: string;
    inputType: string;
    questionId?: string;
}

interface FieldsBySection {
    [section: string]: {
        count: number;
        fields: RecommendedField[];
    };
}

export interface RecommendedFieldsProps {
    fields: RecommendedField[];
    onFieldClick: (section: string, subsectionId: string, questionId?: string) => void;
}

export const RecommendedFields: React.FC<RecommendedFieldsProps> = ({ 
    fields, 
    onFieldClick 
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    if (fields.length === 0) return null;

    const fieldsBySection: FieldsBySection = fields.reduce((acc, field) => {
        if (!acc[field.section]) {
            acc[field.section] = { 
                count: 0, 
                fields: [] 
            };
        }

        acc[field.section].count += 1;
        acc[field.section].fields.push(field);

        return acc;
    }, {} as FieldsBySection);

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

    const handleFieldClick = (field: RecommendedField, e: React.MouseEvent) => {
        e.preventDefault();
        onFieldClick(field.section, sanitizeHtmlId(field.subsection), field.questionId);
    };

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
                <p className="text-gray-600">
                    The following fields are recommended but not required. Consider adding information to make your submission more complete.
                </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {Object.entries(fieldsBySection).map(([section, { count, fields }]) => (
                    <div key={section} className="mb-4 last:mb-0">
                        <button 
                            onClick={() => toggleSection(section)}
                            className="w-full flex items-center justify-between text-left mb-2 group"
                        >
                            <div>
                                <h3 className="font-medium text-gray-900">{section}</h3>
                                <p className="text-gray-600 text-sm">
                                    {count} recommended field{count !== 1 ? 's' : ''}
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
                                {fields.map((field, idx) => (
                                    <div key={idx} className="border-l-2 border-gray-200 pl-3">
                                        <button
                                            onClick={(e) => handleFieldClick(field, e)}
                                            className="block w-full text-left hover:bg-gray-50 p-2 rounded transition-colors"
                                        >
                                            <p className="text-sm font-medium text-gray-900">
                                                {field.questionText}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                In {field.subsection}
                                            </p>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <p className="text-sm text-gray-600 mt-4">
                    Click on any field to navigate to it. You can continue with submission even if these fields are empty.
                </p>
            </div>
        </div>
    );
};
