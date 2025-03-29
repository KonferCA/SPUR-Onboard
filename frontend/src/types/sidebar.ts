import type { ReactNode } from 'react';
import type { User } from '@/types/auth';
/*
 *
 * @typedef ProjectItemConfig
 *
 * @property {string[]} [sections] - the sections of the project
 * @property {(projectId: string, section: string, sectionIndex: number) => void} [sectionClickHandler] - the handler for when a section is clicked
 * @property {(projectId: string) => string | null} [getActiveSection] - the handler for getting the active section
 *
 */
export interface ProjectItemConfig {
    sections?: string[];
    sectionClickHandler?: (
        projectId: string,
        section: string,
        sectionIndex: number
    ) => void;
    getActiveSection?: (projectId: string) => string | null;
}

/*
 *
 * @typedef MenuItem
 *
 * @property {string} path - the path of the menu item
 * @property {string} label - the label of the menu item
 * @property {ReactNode} icon - the icon of the menu item
 * @property {number[]} [permissions] - the permissions required to view the menu item
 * @property {boolean} [isSeparator] - whether the menu item is a separator
 * @property {boolean} [isSubmenu] - whether the menu item is a submenu
 * @property {boolean} [isSectionTitle] - whether the menu item is a section title
 * @property {string} [id] - Tthe id of the menu item
 *
 */
export interface MenuItem {
    path: string;
    label: string;
    icon: ReactNode;
    permissions?: number[];
    isSeparator?: boolean;
    isSubmenu?: boolean;
    isSectionTitle?: boolean;
    id?: string;
}

/*
 *
 * @typedef SidebarProps
 *
 * @property {number} userPermissions - the permissions of the user
 * @property {User} [user] - the user object
 * @property {() => Promise<void>} [onLogout] - the handler for when the user logs out
 *
 */
export interface SidebarProps {
    userPermissions: number;
    user?: User;
    onLogout?: () => Promise<void>;
}
