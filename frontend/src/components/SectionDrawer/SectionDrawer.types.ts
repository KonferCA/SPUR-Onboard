import type { AnchorLinkItem } from '@components';
import type { ValidationError } from '@/components/ProjectError';

export interface SectionDrawerProps {
    activeSection: string;
    subSectionLinks: AnchorLinkItem[];
    validationErrors: ValidationError[];
    /*
     * onRequestChangeSection is used when the drawer needs to change the currently active section
     * based on validationErrors to properly render the list of sub-sections with errors.
     */
    onRequestChangeSection: (section: string) => void;
}
