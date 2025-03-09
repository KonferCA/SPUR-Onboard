import { useCallback, useRef, useEffect } from 'react';

/**
 * A hook that returns a debounced version of the provided callback function.
 * The debounced function will only execute after the specified delay has passed
 * without any new invocations.
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds (defaults to 500ms)
 * @param deps Dependencies array for the callback (optional)
 * @returns A debounced version of the callback
 *
 * @example
 * function SearchComponent() {
 *   const handleSearch = async (query: string) => {
 *     const results = await searchAPI(query);
 *     setSearchResults(results);
 *   };
 *
 *   const debouncedSearch = useDebounce(handleSearch, 300);
 *
 *   return (
 *     <input
 *       type="text"
 *       onChange={(e) => debouncedSearch(e.target.value)}
 *     />
 *   );
 * }
 */
export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay = 500,
    deps: unknown[] = []
): T {
    // use ref to store the timeout ID so it persists across renders
    const timeoutRef = useRef<number | null>(null);

    // clean up the timeout when the component unmounts
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: must spread dependencies because the number of dependencies is unknown
    return useCallback(
        (...args: Parameters<T>) => {
            // clear the previous timeout if it exists
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // set up new timeout
            timeoutRef.current = window.setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [delay, ...deps]
    ) as T;
}
