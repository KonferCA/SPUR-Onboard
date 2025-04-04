export const API_ERROR = 'ApiError';
export const REGISTER_ERROR = 'RegisterError';

export class ApiError extends Error {
    // statusCode represents the status of the response
    public statusCode: number;
    public body: unknown;

    constructor(message: string, statusCode: number, body: unknown) {
        super(message);
        this.name = API_ERROR;
        this.statusCode = statusCode;
        this.body = body;
    }
}

export class RegisterError extends ApiError {
    constructor(message: string, statusCode: number, body: unknown) {
        super(message, statusCode, body);
        this.name = REGISTER_ERROR;
    }
}
