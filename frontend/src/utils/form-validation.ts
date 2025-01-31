import zod from 'zod';

/*
 * Creates an array of ZodSchema that can be used to validate an input.
 */
export function createZodSchema(validations?: string[]) {
    if (!validations) return [];

    const schemas = validations.map((val) => {
        switch (val) {
            case 'url':
                return zod.string().url('Invalid url');
            default:
                throw new Error(`Invalid validation type: ${val}`);
        }
    });

    return schemas;
}
