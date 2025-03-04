import type { AnchorLinkItem } from '@components';
import type { ValidationError } from '@/components/ProjectError';

export interface SectionDrawerProps {
    activeSection: string;
    subSectionLinks: AnchorLinkItem[];
    validationErrors: ValidationError[];
}
