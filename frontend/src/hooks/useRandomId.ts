import { useMemo } from 'react';

/**
 * A hook that generates a random id of length 8 which accepts
 * a prefix for the randomly generated id.
 *
 * @param prefix The prefix for the randomly generated id (optional)
 * @returns A randomly generated id
 *
 * @example
 * function SearchComponent() {
 *   const randomId = useRandomId();
 *
 *   return (
 *     <input
 *       id={randomId}
 *       type="text"
 *     />
 *   );
 * }
 */
export function useRandomId(prefix: string = '') {
    return useMemo(() => {
        const randomPart = Math.random().toString(36).substring(2, 10);
        return `${prefix}${randomPart}`;
    }, [prefix]);
}
