import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

export interface ProjectItemConfig {
    sections?: string[];
    sectionClickHandler?: (projectId: string, section: string, sectionIndex: number) => void;
    getActiveSection?: (projectId: string) => string | null;
}

interface SidebarContextValue {
    // sidebar visibility
    isSidebarVisible: boolean;
    setSidebarVisible: (visible: boolean) => void;

    // mobile drawer state
    isMobileDrawerOpen: boolean;
    setMobileDrawerOpen: (open: boolean) => void;

    // current project
    currentProjectId: string | undefined;
    setCurrentProjectId: (id: string | undefined) => void;

    // project config
    projectConfig: ProjectItemConfig;
    updateProjectConfig: (config: Partial<ProjectItemConfig>) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
    const [projectConfig, setProjectConfig] = useState<ProjectItemConfig>({
        sections: ['The Basics', 'The Details', 'The Team', 'The Financials'],
    });

    const updateProjectConfig = useCallback((config: Partial<ProjectItemConfig>) => {
        setProjectConfig(prev => ({
            ...prev,
            ...config,
        }));
    }, []);

    useEffect(() => {
        const isAuthPage = location.pathname.startsWith('/auth') || 
                            location.pathname === '/login' || 
                            location.pathname === '/register' ||
                            location.pathname === '/signin' ||
                            location.pathname === '/signup';

        setSidebarVisible(!isAuthPage);

        setMobileDrawerOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const match = location.pathname.match(/\/project\/([^/]+)/);
        setCurrentProjectId(match ? match[1] : undefined);
    }, [location.pathname]);

    const contextValue: SidebarContextValue = {
        isSidebarVisible,
        setSidebarVisible,
        isMobileDrawerOpen,
        setMobileDrawerOpen,
        currentProjectId,
        setCurrentProjectId,
        projectConfig,
        updateProjectConfig,
    };

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }

    return context;
};

export { SidebarContext };