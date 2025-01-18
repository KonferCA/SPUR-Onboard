import { expect, describe, it } from 'vitest';
import { createZodSchema } from '@/utils/form-validation';

describe('createZodSchema', () => {
    it('should return an empty array when no validation string is provided', () => {
        const result = createZodSchema();
        expect(result).toEqual([]);
    });

    it('should return an empty array when an empty string is provided', () => {
        const result = createZodSchema('');
        expect(result).toEqual([]);
    });

    it('should create a URL validation schema', () => {
        const schemas = createZodSchema('url');
        expect(schemas).toHaveLength(1);

        // Test valid URL
        const validUrl = 'https://example.com';
        const validationResult = schemas[0].safeParse(validUrl);
        expect(validationResult.success).toBe(true);

        // Test invalid URL
        const invalidUrl = 'not-a-url';
        const invalidValidationResult = schemas[0].safeParse(invalidUrl);
        expect(invalidValidationResult).toBeDefined();
        expect(invalidValidationResult.success).toBe(false);
        expect(invalidValidationResult.error?.errors[0].message).toBe(
            'Invalid url'
        );
    });

    it('should handle multiple validation rules', () => {
        const schemas = createZodSchema('url|url');
        expect(schemas).toHaveLength(2);

        // Both schemas should be URL validators
        schemas.forEach((schema) => {
            const validUrl = 'https://example.com';
            const validationResult = schema.safeParse(validUrl);
            expect(validationResult.success).toBe(true);
        });
    });

    it('should throw error for invalid validation type', () => {
        expect(() => createZodSchema('invalidType')).toThrow(
            'Invalid validation type: invalidType'
        );
    });

    it('should throw error when one of multiple validations is invalid', () => {
        expect(() => createZodSchema('url|invalidType')).toThrow(
            'Invalid validation type: invalidType'
        );
    });
});
