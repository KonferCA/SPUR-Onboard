import type { AnchorLinkItem } from '@components';
import type { ValidationError } from '@/types/project';
import type { RecommendedField } from '@/types';

export type SectionDrawerLinkItem = AnchorLinkItem & {
    missingRequiredCount?: number;
    optionalCount?: number;
    hasErrors?: boolean;
};

export interface SectionDrawerProps {
    activeSection: string;
    subSectionLinks: SectionDrawerLinkItem[];
    validationErrors: ValidationError[];
    recommendedFields: RecommendedField[];
    /*
     * onRequestChangeSection is used when the drawer needs to change the currently active section
     * based on validationErrors to properly render the list of sub-sections with errors. Returns
     * a boolean to indicate whether the request was accepted or not.
     */
    onRequestChangeSection: (section: string) => boolean;
    /*
     * Optional handler for when an error item is clicked
     */
    onErrorClick?: (
        section: string,
        subsection: string,
        questionId?: string
    ) => void;
    /*
     * Optional handler for when a recommended field item is clicked
     */
    onRecommendedFieldClick?: (
        section: string,
        subsection: string,
        questionId?: string
    ) => void;
}
