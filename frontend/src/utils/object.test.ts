import { describe, it, expect } from 'vitest';
import { snakeToCamel } from './object';

describe('Test Object Utilities', () => {
    describe('Test snakeToCamel()', () => {
        it('should transform snake case to camel case', () => {
            const snakeCase = {
                user_id: 123,
                first_name: 'John',
                last_name: 'Doe',
            };
            const camelCase = {
                userId: 123,
                firstName: 'John',
                lastName: 'Doe',
            };
            expect(snakeToCamel(snakeCase)).toEqual(camelCase);
        });

        it('should handle nested objects correctly', () => {
            const input = {
                user_info: {
                    home_address: {
                        street_name: 'Main St',
                        zip_code: '12345',
                    },
                    work_address: {
                        building_number: 42,
                        office_floor: 3,
                    },
                },
            };

            const expected = {
                userInfo: {
                    homeAddress: {
                        streetName: 'Main St',
                        zipCode: '12345',
                    },
                    workAddress: {
                        buildingNumber: 42,
                        officeFloor: 3,
                    },
                },
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle arrays correctly', () => {
            const input = {
                favorite_colors: ['dark_blue', 'light_green'],
                past_addresses: [
                    { street_name: 'Old St', house_number: 1 },
                    { street_name: 'Past Ave', house_number: 2 },
                ],
            };

            const expected = {
                favoriteColors: ['dark_blue', 'light_green'],
                pastAddresses: [
                    { streetName: 'Old St', houseNumber: 1 },
                    { streetName: 'Past Ave', houseNumber: 2 },
                ],
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should handle edge cases correctly', () => {
            // Null values
            expect(snakeToCamel(null)).toBeNull();

            // Undefined values
            expect(snakeToCamel(undefined)).toBeUndefined();

            // Empty object
            expect(snakeToCamel({})).toEqual({});

            // Empty array
            expect(snakeToCamel([])).toEqual([]);

            // Primitive values
            expect(snakeToCamel('test_string')).toBe('test_string');
            expect(snakeToCamel(123)).toBe(123);
            expect(snakeToCamel(true)).toBe(true);
        });

        it('should handle special cases correctly', () => {
            const input = {
                // Multiple underscores
                multiple_word_key: 'value',
                // Already camelCase
                alreadyCamel: 'value',
                // Single letter segments
                a_b_c: 'value',
                // Mixed case
                Mixed_Case_Key: 'value',
                // Numbers in keys
                user_123_id: 'value',
                // Leading/trailing underscores
                _leading_underscore: 'value',
                trailing_underscore_: 'value',
            };

            const expected = {
                multipleWordKey: 'value',
                alreadyCamel: 'value',
                aBC: 'value',
                mixedCaseKey: 'value',
                user123Id: 'value',
                leadingUnderscore: 'value',
                trailingUnderscore: 'value',
            };

            expect(snakeToCamel(input)).toEqual(expected);
        });

        it('should preserve value types', () => {
            const input = {
                string_value: 'string',
                number_value: 42,
                boolean_value: true,
                null_value: null,
                undefined_value: undefined,
                date_value: new Date('2024-01-17'),
                regex_value: /it/,
                array_value: [1, 2, 3],
                nested_object: { inner_key: 'value' },
            };

            const result = snakeToCamel(input);

            expect(typeof result.stringValue).toBe('string');
            expect(typeof result.numberValue).toBe('number');
            expect(typeof result.booleanValue).toBe('boolean');
            expect(result.nullValue).toBeNull();
            expect(result.undefinedValue).toBeUndefined();
            expect(result.dateValue).toBeInstanceOf(Date);
            expect(result.regexValue).toBeInstanceOf(RegExp);
            expect(Array.isArray(result.arrayValue)).toBe(true);
            expect(typeof result.nestedObject).toBe('object');
        });

        it('should not modify the original object', () => {
            const original = {
                user_name: 'John',
                contact_info: {
                    phone_number: '123',
                },
            };

            const originalCopy = JSON.parse(JSON.stringify(original));
            snakeToCamel(original);

            expect(original).toEqual(originalCopy);
        });
    });
});
