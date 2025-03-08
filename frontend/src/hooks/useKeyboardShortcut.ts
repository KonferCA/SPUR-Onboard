import { useCallback, useEffect } from 'react';

type KeyboardShortcut = {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
};

/**
 * Hook to handle keyboard shortcuts
 * @param shortcut The keyboard shortcut configuration
 * @param callback Function to call when the shortcut is triggered
 * @param deps Additional dependencies for the callback
 */
export const useKeyboardShortcut = (
    shortcut: KeyboardShortcut,
    callback: (event: KeyboardEvent) => void,
    deps: any[] = []
) => {
    // memoize the handler to prevent stale event listeners
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const matchesKey =
                event.key.toLowerCase() === shortcut.key.toLowerCase();

            // for ctrl/cmd key, if ctrlKey is specified, match either ctrl or cmd
            const matchesCtrlOrCmd = shortcut.ctrlKey
                ? event.ctrlKey || event.metaKey
                : true;

            // for specific meta key check (if needed)
            const matchesMeta = shortcut.metaKey ? event.metaKey : true;
            const matchesAlt = shortcut.altKey ? event.altKey : true;
            const matchesShift = shortcut.shiftKey ? event.shiftKey : true;

            if (
                matchesKey &&
                matchesCtrlOrCmd &&
                matchesMeta &&
                matchesAlt &&
                matchesShift
            ) {
                event.preventDefault();
                callback(event);
            }
        },
        [shortcut, callback, ...deps]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
