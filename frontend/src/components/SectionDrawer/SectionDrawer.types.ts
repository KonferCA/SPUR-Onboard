import type { AnchorLinkItem } from '@components';
import type { ValidationError } from '@/components/ProjectError';

export type SectionDrawerLinkItem = AnchorLinkItem & {
    missingRequiredCount?: number;
    hasErrors?: boolean;
};

export interface SectionDrawerProps {
    activeSection: string;
    subSectionLinks: SectionDrawerLinkItem[];
    validationErrors: ValidationError[];
    /*
     * onRequestChangeSection is used when the drawer needs to change the currently active section
     * based on validationErrors to properly render the list of sub-sections with errors. Returns
     * a boolean to indicate whether the request was accepted or not.
     */
    onRequestChangeSection: (section: string) => boolean;
}
