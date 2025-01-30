/**
 * Converts an object's keys from snake_case to camelCase.
 * Handles nested objects and arrays recursively.
 *
 * @param obj - The object to transform
 * @returns A new object with all keys converted to camelCase
 *
 * @example
 * const input = {
 *   user_name: "john_doe",
 *   contact_info: { phone_number: "123" }
 * };
 * const output = snakeToCamel(input);
 * // Result: { userName: "john_doe", contactInfo: { phoneNumber: "123" } }
 */
export function snakeToCamel(obj: any): any {
    // Handle null or undefined
    if (obj === null || obj === undefined) {
        return obj as any;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map((item) => snakeToCamel(item)) as any;
    }

    // Handle non-objects, strictly instances that are not {}
    if (typeof obj !== 'object' || obj.constructor !== Object) {
        return obj as any;
    }

    const result = Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            // Transform the key
            const newKeyParts = key
                // Remove leading and trailing underscores
                .replace(/^_+|_+$/g, '')
                // Split by underscore to get each word in the key
                .split('_');

            // Convert snake case to came case
            const newKey =
                newKeyParts.length === 1
                    ? newKeyParts.join('')
                    : newKeyParts
                          .map((v, i) =>
                              i > 0
                                  ? v.charAt(0).toUpperCase() + v.slice(1)
                                  : v.toLowerCase()
                          )
                          .join('');

            // Recursively transform nested objects and arrays
            return [newKey, snakeToCamel(value)];
        })
    );

    return result as any;
}
