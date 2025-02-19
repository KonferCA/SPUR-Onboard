import { randomId } from '@/utils/random';
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
    return useMemo(() => randomId(prefix), [prefix]);
}
