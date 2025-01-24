import { ProjectQuestion } from '@/services/project';
import { FormField, FormFieldType } from '@/types';
import { createZodSchema } from '@/utils/form-validation';

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
    const sortedQuestions = [...questions].sort((a, b) => {
        if (a.sectionOrder !== b.sectionOrder)
            return a.sectionOrder - b.sectionOrder;
        if (a.subSectionOrder !== b.subSectionOrder)
            return a.subSectionOrder - b.subSectionOrder;
        return a.questionOrder - b.questionOrder;
    });

    return sortedQuestions.reduce<GroupedProjectQuestions[]>(
        (acc, projectQuestion) => {
            let group = acc.find((g) => g.section === projectQuestion.section);
            if (!group) {
                group = {
                    section: projectQuestion.section,
                    subSections: [],
                    subSectionNames: [],
                };
                acc.push(group);
            }

            let subSection = group.subSections.find(
                (s) => s.name === projectQuestion.subSection
            );
            if (!subSection) {
                subSection = {
                    name: projectQuestion.subSection,
                    questions: [],
                };
                group.subSections.push(subSection);
                group.subSectionNames.push(projectQuestion.subSection);
            }

            const inputField: FormField = {
                key: projectQuestion.inputTypeId,
                type: projectQuestion.inputType as FormFieldType,
                label: projectQuestion.question,
                required: projectQuestion.required,
                options: projectQuestion.options?.map((opt, idx) => ({
                    id: idx,
                    label: opt,
                    value: opt,
                })),
                validations: projectQuestion.validations
                    ? createZodSchema(projectQuestion.validations)
                    : undefined,
            };

            let question = subSection.questions.find(
                (q) => q.id === projectQuestion.id
            );
            if (!question) {
                question = {
                    id: projectQuestion.id,
                    question: projectQuestion.question,
                    required: projectQuestion.required,
                    inputFields: [inputField],
                };
                subSection.questions.push(question);
            } else {
                question.inputFields.push(inputField);
            }

            return acc;
        },
        []
    );
}
