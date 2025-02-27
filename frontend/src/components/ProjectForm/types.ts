import { ConditionType } from '@/services/project';
import { FormField } from '@/types';

export interface Question {
    id: string;
    question: string;
    required: boolean;
    inputFields: FormField[];
    dependentQuestionId?: string;
    conditionType?: ConditionType;
    conditionValue?: string;
    questionGroupId?: string;
    questionOrder: number;
    description?: string;
    answer?: string;
}

export interface SubSection {
    name: string;
    questions: Question[];
}

export interface GroupedProjectQuestions {
    // section basically serves as the id of the group
    section: string;
    subSections: SubSection[];
    subSectionNames: string[];
}

export interface ProjectFormProps {
    questions: GroupedProjectQuestions;
}
