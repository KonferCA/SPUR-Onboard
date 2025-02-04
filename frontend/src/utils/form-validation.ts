import { FormFieldType } from '@/types';
import zod from 'zod';

/*
 * Creates an array of ZodSchema that can be used to validate an input
 * based on the input type and validation rules.
 */
export function createZodSchema(
    inputType: FormFieldType,
    validations?: string[]
): zod.ZodTypeAny[] {
    if (!validations) return [];

    const schemas: zod.ZodTypeAny[] = validations.map((val) => {
        // Split validation rule to handle parameters
        const [rule, param] = val.split('=');

        switch (rule) {
            case 'url':
                return zod.string().url('Invalid URL');
            case 'email':
                return zod.string().email('Invalid email address');
            case 'min':
                return zod
                    .string()
                    .min(
                        parseInt(param || '0'),
                        `Must be at least ${param} characters`
                    );
            case 'max':
                return zod
                    .string()
                    .max(
                        parseInt(param || '0'),
                        `Must be at most ${param} characters`
                    );
            case 'regex':
                return zod
                    .string()
                    .regex(
                        new RegExp(param || ''),
                        'Must match the required format'
                    );
            case 'linkedin_url':
                return zod
                    .string()
                    .url('Invalid URL')
                    .regex(
                        /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
                        'Must be a valid LinkedIn URL'
                    );
            case 'wallet_address':
                return zod
                    .string()
                    .regex(
                        /^0x[0-9a-fA-F]{64}$/,
                        'Must be a valid wallet address'
                    );
            default:
                throw new Error(`Invalid validation type: ${rule}`);
        }
    });

    // Add input-type specific validations
    switch (inputType) {
        case 'date':
            schemas.push(zod.coerce.date());
            break;
        case 'select':
        case 'multiselect':
            // These are handled by the component itself
            break;
        case 'file':
            // File validation is handled separately
            break;
    }

    return schemas;
}
