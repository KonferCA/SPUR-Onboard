import { format, fromUnixTime } from 'date-fns';

/*
 * Formats a unix timestamp to a human readable version.
 * The default format is 'MMM d, yyyy' => February 1, 2025
 */
export const formatUnixTimestamp = (
    timestamp: number,
    formatStr = 'MMMM d, yyyy'
): string => {
    try {
        // Convert Unix timestamp to Date object
        const date = fromUnixTime(timestamp);
        return format(date, formatStr);
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return 'Invalid date';
    }
};
