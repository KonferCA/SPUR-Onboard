/*
 * Http status code enum for easy access and type safety.
 */
export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

/*
 * Constructs a url string with the right backend url and given path.
 * The path can be optional.
 * The url returned is for APIs.
 */
export function getApiUrl(path = '') {
    // remove leading / if any
    // biome-ignore lint: reassign param because it is better this way
    if (path.length > 0 && path[0] === '/') path = path.slice(1);
    const prefix = import.meta.env.VITE_API_URL;
    return `${prefix}/${path}`;
}
