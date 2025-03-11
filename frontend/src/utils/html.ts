export function sanitizeHtmlId(str: string) {
    // Return empty string if provided str is empty
    if (!str.length) return str;

    // Convert to string in case we receive a number or other type
    const id = String(str)
        // Convert to lowercase
        .toLowerCase()
        // Replace spaces and underscores with hyphens
        .replace(/[\s_]+/g, '-')
        // Remove any non-alphanumeric characters except hyphens
        .replace(/[^a-z0-9-]/g, '')
        // Remove hyphens from start and end
        .replace(/^-+|-+$/g, '')
        // Ensure it doesn't start with a number
        .replace(/^(\d)/, 'id-$1');

    return id;
}
