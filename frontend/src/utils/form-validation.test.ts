import { expect, describe, it } from 'vitest';
import {
    createZodSchema,
    isValidEquity,
    validateFundingStructure,
    validateSocialLink,
    validateTargetFunding,
    validateMinimumFunding,
    validateTieredFunding,
} from '@/utils/form-validation';
import { SocialPlatform } from '@/types/auth';
import type { FundingStructureModel } from '@/components/FundingStructure';

describe('createZodSchema', () => {
    it('should return an empty array when no validation string is provided', () => {
        const result = createZodSchema('textinput');
        expect(result).toEqual([]);
    });

    it('should return an empty array when an empty string is provided', () => {
        const result = createZodSchema('textinput', []);
        expect(result).toEqual([]);
    });

    it('should create a URL validation schema', () => {
        const schemas = createZodSchema('textinput', ['url']);
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
            'Invalid URL'
        );
    });

    it('should create an email validation schema', () => {
        const schemas = createZodSchema('textinput', ['email']);
        expect(schemas).toHaveLength(1);

        // Test valid email
        const validEmail = 'user@example.com';
        const validationResult = schemas[0].safeParse(validEmail);
        expect(validationResult.success).toBe(true);

        // Test invalid email
        const invalidEmail = 'not-an-email';
        const invalidValidationResult = schemas[0].safeParse(invalidEmail);
        expect(invalidValidationResult).toBeDefined();
        expect(invalidValidationResult.success).toBe(false);
        expect(invalidValidationResult.error?.errors[0].message).toBe(
            'Invalid email address'
        );
    });

    it('should create a min validation schema', () => {
        const schemas = createZodSchema('textinput', ['min=5']);
        expect(schemas).toHaveLength(1);

        // Test valid length
        const validInput = 'abcdef';
        const validationResult = schemas[0].safeParse(validInput);
        expect(validationResult.success).toBe(true);

        // Test invalid length
        const invalidInput = 'abc';
        const invalidValidationResult = schemas[0].safeParse(invalidInput);
        expect(invalidValidationResult).toBeDefined();
        expect(invalidValidationResult.success).toBe(false);
        expect(invalidValidationResult.error?.errors[0].message).toBe(
            'Must be at least 5 characters'
        );
    });

    it('should create a max validation schema', () => {
        const schemas = createZodSchema('textinput', ['max=5']);
        expect(schemas).toHaveLength(1);

        // Test valid length
        const validInput = 'abc';
        const validationResult = schemas[0].safeParse(validInput);
        expect(validationResult.success).toBe(true);

        // Test invalid length
        const invalidInput = 'abcdefg';
        const invalidValidationResult = schemas[0].safeParse(invalidInput);
        expect(invalidValidationResult).toBeDefined();
        expect(invalidValidationResult.success).toBe(false);
        expect(invalidValidationResult.error?.errors[0].message).toBe(
            'Must be at most 5 characters'
        );
    });

    it('should handle empty parameters for min and max', () => {
        const schemaMin = createZodSchema('textinput', ['min=']);
        const schemaMax = createZodSchema('textinput', ['max=']);

        expect(schemaMin[0].safeParse('').success).toBe(true);
        expect(schemaMax[0].safeParse('a'.repeat(100)).success).toBe(false);
    });

    it('should create a linkedin_url validation schema', () => {
        const schemas = createZodSchema('textinput', ['linkedin_url']);
        expect(schemas).toHaveLength(1);

        // Test valid LinkedIn URL
        const validUrl = 'https://linkedin.com/in/username';
        const validationResult = schemas[0].safeParse(validUrl);
        expect(validationResult.success).toBe(true);

        // Test invalid LinkedIn URL
        const invalidUrl = 'https://facebook.com/username';
        const invalidValidationResult = schemas[0].safeParse(invalidUrl);
        expect(invalidValidationResult).toBeDefined();
        expect(invalidValidationResult.success).toBe(false);
    });

    it('should create a wallet_address validation schema', () => {
        const schemas = createZodSchema('textinput', ['wallet_address']);
        expect(schemas).toHaveLength(1);

        // Test valid wallet address
        const validAddress = '0x' + '1'.repeat(40);
        const validationResult = schemas[0].safeParse(validAddress);
        expect(validationResult.success).toBe(true);

        // Test invalid wallet address
        const invalidAddress = '0x123';
        const invalidValidationResult = schemas[0].safeParse(invalidAddress);
        expect(invalidValidationResult).toBeDefined();
        expect(invalidValidationResult.success).toBe(false);
        expect(invalidValidationResult.error?.errors[0].message).toBe(
            'Must be a valid Ethereum wallet address'
        );
    });

    it('should handle multiple validation rules', () => {
        const schemas = createZodSchema('textinput', ['url', 'url']);
        expect(schemas).toHaveLength(2);

        // Both schemas should be URL validators
        schemas.forEach((schema) => {
            const validUrl = 'https://example.com';
            const validationResult = schema.safeParse(validUrl);
            expect(validationResult.success).toBe(true);
        });
    });

    it('should throw error for invalid validation type', () => {
        expect(() => createZodSchema('textinput', ['invalidType'])).toThrow(
            'Invalid validation type: invalidType'
        );
    });

    it('should throw error when one of multiple validations is invalid', () => {
        expect(() =>
            createZodSchema('textinput', ['url', 'invalidType'])
        ).toThrow('Invalid validation type: invalidType');
    });
});

describe('validateSocialLink', () => {
    it('should validate LinkedIn URLs', () => {
        const validUrls = [
            'https://www.linkedin.com/in/username',
            'http://linkedin.com/in/user-name',
            'linkedin.com/pub/username',
            'https://linkedin.com/profile/user123',
        ];
        const invalidUrls = [
            'linkedin.com/invalid/username',
            'https://linkedin.com/username',
            'https://fakelinkedin.com/in/username',
            'not-a-url',
        ];

        validUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.LinkedIn,
                    urlOrHandle: url,
                })
            ).toBe(true);
        });
        invalidUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.LinkedIn,
                    urlOrHandle: url,
                })
            ).toBe(false);
        });
    });

    it('should validate Instagram handles', () => {
        const validHandles = [
            '@username',
            'username',
            'user.name',
            'user_name123',
        ];
        const invalidHandles = ['@user name', 'user@name', 'user$name'];

        validHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.Instagram,
                    urlOrHandle: handle,
                })
            ).toBe(true);
        });
        invalidHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.Instagram,
                    urlOrHandle: handle,
                })
            ).toBe(false);
        });
    });

    it('should validate X (Twitter) handles', () => {
        const validHandles = ['@username', 'username', 'user_name', 'user123'];
        const invalidHandles = [
            '@use',
            'toolongusername123456',
            '@user.name',
            '@user$name',
        ];

        validHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.X,
                    urlOrHandle: handle,
                })
            ).toBe(true);
        });
        invalidHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.X,
                    urlOrHandle: handle,
                })
            ).toBe(false);
        });
    });

    it('should validate X (Twitter) URLs', () => {
        const validUrls = [
            'https://twitter.com/username',
            'http://twitter.com/user_name',
            'https://www.twitter.com/user123',
        ];
        const invalidUrls = [
            'https://twitter.com/use', // too short
            'https://twitter.com/toolongusername123456', // too long
            'https://twitter.com/user.name', // invalid character
            'https://faketwitter.com/username', // wrong domain
            'twitter/username', // not a URL
        ];

        validUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.X,
                    urlOrHandle: url,
                })
            ).toBe(true);
        });
        invalidUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.X,
                    urlOrHandle: url,
                })
            ).toBe(false);
        });
    });

    it('should validate Facebook URLs', () => {
        const validUrls = [
            'https://www.facebook.com/username',
            'http://facebook.com/username.123',
            'facebook.com/username.profile',
        ];
        const invalidUrls = [
            'facebook.com/user',
            'https://facebook.com/user name',
            'https://fakefacebook.com/username',
            'not-a-url',
        ];

        validUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.Facebook,
                    urlOrHandle: url,
                })
            ).toBe(true);
        });
        invalidUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.Facebook,
                    urlOrHandle: url,
                })
            ).toBe(false);
        });
    });

    it('should validate BlueSky handles', () => {
        const validHandles = [
            '@username.bsky.social',
            'handle.domain.com',
            'user-name.bsky.social',
        ];
        const invalidHandles = [
            '@us.bsky.social',
            'username',
            '@username',
            'invalid-format',
        ];

        validHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.BlueSky,
                    urlOrHandle: handle,
                })
            ).toBe(true);
        });
        invalidHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.BlueSky,
                    urlOrHandle: handle,
                })
            ).toBe(false);
        });
    });

    it('should validate Discord handles', () => {
        const validHandles = [
            'username',
            'user_name',
            'user.name',
            'username#1234',
        ];
        const invalidHandles = [
            'u',
            'toolongusername'.repeat(3),
            'user@name',
            'username#123',
        ];

        validHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.Discord,
                    urlOrHandle: handle,
                })
            ).toBe(true);
        });
        invalidHandles.forEach((handle) => {
            expect(
                validateSocialLink({
                    platform: SocialPlatform.Discord,
                    urlOrHandle: handle,
                })
            ).toBe(false);
        });
    });

    it('should validate generic URLs for unknown platforms', () => {
        const validUrls = [
            'https://example.com',
            'http://subdomain.example.com',
            'example.com/path',
        ];
        const invalidUrls = [
            'not-a-url',
            'http://',
            'https://.com',
            'just text',
        ];

        validUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: 'unknown' as SocialPlatform,
                    urlOrHandle: url,
                })
            ).toBe(true);
        });
        invalidUrls.forEach((url) => {
            expect(
                validateSocialLink({
                    platform: 'unknown' as SocialPlatform,
                    urlOrHandle: url,
                })
            ).toBe(false);
        });
    });
});

describe('isValidEquity', () => {
    it('should return true for valid equity values', () => {
        const validEquities = [
            '1',
            '50',
            '99',
            '0.5',
            '99.99',
            '0.001',
            '99.999',
        ];

        validEquities.forEach((equity) => {
            expect(isValidEquity(equity)).toBe(true);
        });
    });

    it('should return false for invalid equity values', () => {
        const invalidEquities = [
            '0',
            '-1',
            '101',
            'abc',
            '100',
            '100.1',
            '',
            undefined,
        ];

        invalidEquities.forEach((equity) => {
            // @ts-ignore - testing with undefined
            expect(isValidEquity(equity)).toBe(false);
        });
    });

    it('should handle edge cases for exclusive range', () => {
        // These values should be false as the range is now exclusive (0,100)
        expect(isValidEquity('0')).toBe(false);
        expect(isValidEquity('0.0')).toBe(false);
        expect(isValidEquity('0.00000')).toBe(false);
        expect(isValidEquity('100')).toBe(false);
        expect(isValidEquity('100.0')).toBe(false);
        expect(isValidEquity('100.00000')).toBe(false);

        // These values very close to boundaries should be true
        expect(isValidEquity('0.000001')).toBe(true);
        expect(isValidEquity('99.999999')).toBe(true);
    });
});

describe('validateTargetFunding', () => {
    it('should validate a correct target funding structure', () => {
        const validStructure: FundingStructureModel = {
            type: 'target',
            amount: '100000',
            equityPercentage: '10',
            limitInvestors: false,
        };

        expect(validateTargetFunding(validStructure)).toBe(true);
    });

    it('should reject invalid amount', () => {
        const invalidAmounts: FundingStructureModel[] = [
            {
                type: 'target',
                amount: '-100',
                equityPercentage: '10',
                limitInvestors: false,
            },
            {
                type: 'target',
                amount: '0',
                equityPercentage: '10',
                limitInvestors: false,
            },
            {
                type: 'target',
                amount: 'abc',
                equityPercentage: '10',
                limitInvestors: false,
            },
        ];

        invalidAmounts.forEach((structure) => {
            expect(validateTargetFunding(structure)).toBe(false);
        });
    });

    it('should reject invalid equity percentage', () => {
        const invalidEquities: FundingStructureModel[] = [
            {
                type: 'target',
                amount: '100000',
                equityPercentage: '0',
                limitInvestors: false,
            },
            {
                type: 'target',
                amount: '100000',
                equityPercentage: '100',
                limitInvestors: false,
            },
            {
                type: 'target',
                amount: '100000',
                equityPercentage: '101',
                limitInvestors: false,
            },
            {
                type: 'target',
                amount: '100000',
                equityPercentage: '-10',
                limitInvestors: false,
            },
            {
                type: 'target',
                amount: '100000',
                equityPercentage: 'abc',
                limitInvestors: false,
            },
        ];

        invalidEquities.forEach((structure) => {
            expect(validateTargetFunding(structure)).toBe(false);
        });
    });
});

describe('validateMinimumFunding', () => {
    it('should validate a correct minimum funding structure', () => {
        const validStructure: FundingStructureModel = {
            type: 'minimum',
            amount: '100000',
            equityPercentage: '10',
            minAmount: '50000',
            maxAmount: '150000',
            limitInvestors: false,
        };

        expect(validateMinimumFunding(validStructure)).toBe(true);
    });

    it('should reject missing minimum amount', () => {
        const missingMin: FundingStructureModel = {
            type: 'minimum',
            amount: '100000',
            equityPercentage: '10',
            maxAmount: '150000',
            limitInvestors: false,
        };

        expect(validateMinimumFunding(missingMin)).toBe(false);
    });

    it('should reject missing maximum amount', () => {
        const missingMax: FundingStructureModel = {
            type: 'minimum',
            amount: '100000',
            equityPercentage: '10',
            minAmount: '50000',
            limitInvestors: false,
        };

        expect(validateMinimumFunding(missingMax)).toBe(false);
    });

    it('should reject invalid minimum amount', () => {
        const invalidMinAmounts: FundingStructureModel[] = [
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '0',
                maxAmount: '150000',
                limitInvestors: false,
            },
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '-50000',
                maxAmount: '150000',
                limitInvestors: false,
            },
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: 'abc',
                maxAmount: '150000',
                limitInvestors: false,
            },
        ];

        invalidMinAmounts.forEach((structure) => {
            expect(validateMinimumFunding(structure)).toBe(false);
        });
    });

    it('should reject invalid maximum amount', () => {
        const invalidMaxAmounts: FundingStructureModel[] = [
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '50000',
                maxAmount: '0',
                limitInvestors: false,
            },
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '50000',
                maxAmount: '-150000',
                limitInvestors: false,
            },
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '50000',
                maxAmount: 'abc',
                limitInvestors: false,
            },
        ];

        invalidMaxAmounts.forEach((structure) => {
            expect(validateMinimumFunding(structure)).toBe(false);
        });
    });

    it('should reject when minimum amount > maximum amount', () => {
        const invalidRange: FundingStructureModel = {
            type: 'minimum',
            amount: '100000',
            equityPercentage: '10',
            minAmount: '200000',
            maxAmount: '150000',
            limitInvestors: false,
        };

        expect(validateMinimumFunding(invalidRange)).toBe(false);
    });

    it('should reject invalid equity percentage', () => {
        const invalidEquities: FundingStructureModel[] = [
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '0',
                minAmount: '50000',
                maxAmount: '150000',
                limitInvestors: false,
            },
            {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '100',
                minAmount: '50000',
                maxAmount: '150000',
                limitInvestors: false,
            },
        ];

        invalidEquities.forEach((structure) => {
            expect(validateMinimumFunding(structure)).toBe(false);
        });
    });
});

describe('validateTieredFunding', () => {
    it('should validate a correct tiered funding structure', () => {
        const validStructure: FundingStructureModel = {
            type: 'tiered',
            amount: '100000',
            equityPercentage: '10',
            limitInvestors: false,
            tiers: [
                { id: '1', amount: '50000', equityPercentage: '5' },
                { id: '2', amount: '50000', equityPercentage: '5' },
            ],
        };

        expect(validateTieredFunding(validStructure)).toBe(true);
    });

    it('should reject when no tiers are provided', () => {
        const noTiers: FundingStructureModel = {
            type: 'tiered',
            amount: '100000',
            equityPercentage: '10',
            limitInvestors: false,
            tiers: [],
        };

        expect(validateTieredFunding(noTiers)).toBe(false);
    });

    it('should reject when total equity exceeds 100%', () => {
        const excessEquity: FundingStructureModel = {
            type: 'tiered',
            amount: '100000',
            equityPercentage: '10',
            limitInvestors: false,
            tiers: [
                { id: '1', amount: '50000', equityPercentage: '60' },
                { id: '2', amount: '50000', equityPercentage: '50' },
            ],
        };

        expect(validateTieredFunding(excessEquity)).toBe(false);
    });

    it('should validate each tier equity is within range', () => {
        const invalidTierEquities: FundingStructureModel[] = [
            {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '50000', equityPercentage: '0' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            },
            {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '50000', equityPercentage: '100' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            },
        ];

        invalidTierEquities.forEach((structure) => {
            expect(validateTieredFunding(structure)).toBe(false);
        });
    });

    it('should validate each tier amount is greater than 0', () => {
        const invalidTierAmounts: FundingStructureModel[] = [
            {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '0', equityPercentage: '10' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            },
            {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '-50000', equityPercentage: '10' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            },
        ];

        invalidTierAmounts.forEach((structure) => {
            expect(validateTieredFunding(structure)).toBe(false);
        });
    });

    it('should handle invalid values in tiers', () => {
        const invalidTierValues: FundingStructureModel[] = [
            {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '50000', equityPercentage: 'invalid' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            },
            {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: 'invalid', equityPercentage: '10' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            },
        ];

        invalidTierValues.forEach((structure) => {
            expect(validateTieredFunding(structure)).toBe(false);
        });
    });
});

describe('validateFundingStructure', () => {
    describe('target funding', () => {
        it('should validate a correct target funding structure', () => {
            const validStructure: FundingStructureModel = {
                type: 'target',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
            };

            expect(validateFundingStructure(validStructure)).toBe(true);
        });

        it('should reject invalid amount', () => {
            const invalidAmount: FundingStructureModel = {
                type: 'target',
                amount: '-100',
                equityPercentage: '10',
                limitInvestors: false,
            };

            expect(validateFundingStructure(invalidAmount)).toBe(false);
        });

        it('should reject invalid equity percentage', () => {
            const invalidEquity: FundingStructureModel = {
                type: 'target',
                amount: '100000',
                equityPercentage: '101',
                limitInvestors: false,
            };

            expect(validateFundingStructure(invalidEquity)).toBe(false);
        });
    });

    describe('minimum funding', () => {
        it('should validate a correct minimum funding structure', () => {
            const validStructure: FundingStructureModel = {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '50000',
                maxAmount: '150000',
                limitInvestors: false,
            };

            expect(validateFundingStructure(validStructure)).toBe(true);
        });

        it('should reject missing minimum amount', () => {
            const missingMin: FundingStructureModel = {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                maxAmount: '150000',
                limitInvestors: false,
            };

            expect(validateFundingStructure(missingMin)).toBe(false);
        });

        it('should reject missing maximum amount', () => {
            const missingMax: FundingStructureModel = {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '50000',
                limitInvestors: false,
            };

            expect(validateFundingStructure(missingMax)).toBe(false);
        });

        it('should reject when minimum amount > maximum amount', () => {
            const invalidRange: FundingStructureModel = {
                type: 'minimum',
                amount: '100000',
                equityPercentage: '10',
                minAmount: '200000',
                maxAmount: '150000',
                limitInvestors: false,
            };

            expect(validateFundingStructure(invalidRange)).toBe(false);
        });
    });

    describe('tiered funding', () => {
        it('should validate a correct tiered funding structure', () => {
            const validStructure: FundingStructureModel = {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '50000', equityPercentage: '5' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            };

            expect(validateFundingStructure(validStructure)).toBe(true);
        });

        it('should reject when no tiers are provided', () => {
            const noTiers: FundingStructureModel = {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [],
            };

            expect(validateFundingStructure(noTiers)).toBe(false);
        });

        it('should reject when total equity exceeds 100%', () => {
            const excessEquity: FundingStructureModel = {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '50000', equityPercentage: '60' },
                    { id: '2', amount: '50000', equityPercentage: '50' },
                ],
            };

            expect(validateFundingStructure(excessEquity)).toBe(false);
        });

        it('should handle invalid equity values in tiers', () => {
            const invalidTierEquity: FundingStructureModel = {
                type: 'tiered',
                amount: '100000',
                equityPercentage: '10',
                limitInvestors: false,
                tiers: [
                    { id: '1', amount: '50000', equityPercentage: 'invalid' },
                    { id: '2', amount: '50000', equityPercentage: '5' },
                ],
            };

            expect(validateFundingStructure(invalidTierEquity)).toBe(false);
        });
    });

    it('should reject unknown funding types', () => {
        const unknownType = {
            type: 'unknown',
            amount: '100000',
            equityPercentage: '10',
            limitInvestors: false,
        };

        //@ts-ignore: the type is invalid and the function should be able to handle it
        expect(validateFundingStructure(unknownType)).toBe(false);
    });
});
