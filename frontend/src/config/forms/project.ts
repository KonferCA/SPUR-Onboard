import { ProjectQuestion } from '@/services/project';
import { FormField, FormFieldType } from '@/types';
import { createZodSchema } from '@/utils/form-validation';
import { ZodString } from 'zod';

export interface GroupedProjectQuestions {
    // section basically serves as the id of the group
    section: string;
    subSections: SubSection[];
    subSectionNames: string[];
}

export interface SubSection {
    name: string;
    questions: Question[];
}

export interface Question {
    id: string;
    question: string;
    required: boolean;
    validations: ZodString[];
    options?: string[];
    inputFields: FormField[];
}

/*
 * This will sort based on the sections order array and group the questions that belong
 * to the same section together. The questions in a section will also be sorted based on their
 * sub section order.
 */
export function groupProjectQuestions(
    questions: ProjectQuestion[]
): GroupedProjectQuestions[] {
    // Sort questions based on all order fields
    const sortedQuestions = [...questions].sort((a, b) => {
        // First sort by section_order
        if (a.sectionOrder !== b.sectionOrder) {
            return a.sectionOrder - b.sectionOrder;
        }

        // If same section, sort by sub_section_order
        if (a.subSectionOrder !== b.subSectionOrder) {
            return a.subSectionOrder - b.subSectionOrder;
        }

        // If same subsection, sort by question_order
        return a.questionOrder - b.questionOrder;
    });

    // Group questions by section and maintain ordered subsection names
    const groupedBySection = sortedQuestions.reduce<GroupedProjectQuestions[]>(
        (acc, projectQuestion) => {
            // Find existing group for this section
            let group = acc.find((g) => g.section === projectQuestion.section);

            // Create SubSection object from the question
            const question: Question = {
                id: projectQuestion.id,
                question: projectQuestion.question,
                required: projectQuestion.required,
                validations: createZodSchema(projectQuestion.validations),
                options: projectQuestion.options,
                inputFields: projectQuestion.inputType
                    .split('|')
                    .map((t, idx) => {
                        const field: FormField = {
                            id: `${projectQuestion.id}_${idx}`,
                            type: t as FormFieldType,
                            label: projectQuestion.question,
                            required: projectQuestion.required,
                            options: projectQuestion.options?.map(
                                (opt, idx) => ({
                                    id: idx,
                                    label: opt,
                                    value: opt,
                                })
                            ),
                        };
                        return field;
                    }),
            };

            if (group) {
                // Find the sub section
                let subSectionIdx = group.subSections.findIndex((s) => {
                    return s.name === projectQuestion.subSection;
                });
                if (subSectionIdx !== -1) {
                    // Add to existing sub-section
                    group.subSections[subSectionIdx].questions.push(question);
                } else {
                    // Create new sub section
                    group.subSections.push({
                        name: projectQuestion.subSection,
                        questions: [question],
                    });
                }
                // Add subSection name if it's not already in the array
                // Everything has been sorted beforehand so the sub sections
                // are also in the right order.
                if (
                    !group.subSectionNames.includes(projectQuestion.subSection)
                ) {
                    group.subSectionNames.push(projectQuestion.subSection);
                }
            } else {
                // Create new group
                acc.push({
                    section: projectQuestion.section,
                    subSections: [
                        {
                            name: projectQuestion.subSection,
                            questions: [question],
                        },
                    ],
                    subSectionNames: [projectQuestion.subSection],
                });
            }
            return acc;
        },
        []
    );

    return groupedBySection;
}
