/*
 * Utilify to generate a random id of length 8 with an optional prefix.
 */
export function randomId(prefix = '') {
    const randomPart = Math.random().toString(36).substring(2, 10);
    return prefix + randomPart;
}
