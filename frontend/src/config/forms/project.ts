import { ProjectQuestion } from '@/services/project';
import { createZodSchema } from '@/utils/form-validation';
import { ZodString } from 'zod';

export const sectionsOrder: string[] = [
    'the basics',
    'the team',
    'the financials',
];

export interface GroupedProjectQuestions {
    // section basically serves as the id of the group
    section: string;
    subSections: SubSection[];
    subSectionNames: string[];
}

export interface SubSection {
    id: string;
    question: string;
    section: string;
    subSection: string;
    required: boolean;
    validations: ZodString[];
    options?: string[];
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
        (acc, question) => {
            // Find existing group for this section
            let group = acc.find((g) => g.section === question.section);

            // Create SubSection object from the question
            const subSection: SubSection = {
                id: question.id,
                question: question.question,
                section: question.section,
                subSection: question.subSection,
                required: question.required,
                validations: createZodSchema(question.validations),
                options: question.options,
            };

            if (group) {
                // Add to existing group
                group.subSections.push(subSection);
                // Add subSection name if it's not already in the array
                // Everything has been sorted beforehand so the sub sections
                // are also in the right order.
                if (!group.subSectionNames.includes(question.subSection)) {
                    group.subSectionNames.push(question.subSection);
                }
            } else {
                // Create new group
                acc.push({
                    section: question.section,
                    subSections: [subSection],
                    subSectionNames: [question.subSection],
                });
            }
            return acc;
        },
        []
    );

    return groupedBySection;
}
