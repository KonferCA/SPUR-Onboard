import { useEffect } from 'react';

/**
 * custom hook to set page title
 * @param title page title to set (will be appended to "Onboard | " if provided)
 */
export const usePageTitle = (title?: string): void => {
    useEffect(() => {
        // set the title to "Onboard" or "Onboard | {title}" if a title is provided
        document.title = title ? `Onboard | ${title}` : 'Onboard';

        // cleanup function to reset the title when component unmounts
        return () => {
            document.title = 'Onboard';
        };
    }, [title]);
};

export default usePageTitle;
