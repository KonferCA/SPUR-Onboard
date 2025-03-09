import type { FormFieldType } from '@/types';
import { SocialPlatform, type UserSocial } from '@/types/auth';
import zod from 'zod';

const LINKEDIN_PROFILE_URL_REGEX =
    /^(https?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/?$/;
// Refer to: https://www.facebook.com/help/105399436216001/
const FACEBOOK_PROFILE_URL_REGEX =
    /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9\.]{5,}$/;
const INSTAGRAM_USERNAME_REGEX = /^@?[a-zA-Z0-9\._]+$/;
// Refer to: https://help.x.com/en/managing-your-account/x-username-rules
const X_USERNAME_REGEX = /^@?[a-zA-Z0-9_]{4,15}$/;
const BLUESKY_USERNAME_REGEX = /^@?([a-zA-Z\-]{3,})\..+\..+$/;
// Refer to: https://support.discord.com/hc/en-us/articles/12620128861463-New-Usernames-Display-Names
const DISCORD_USERNAME_REGEX =
    /^@?([a-z0-9\._]{2,32}$)|([a-zA-Z0-9\._]{2,32}#\d{4}$)/;
const URL_REGEX =
    /^(https?:\/\/)?(www\.)?\w+\.\w{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

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
                        Number.parseInt(param || '0'),
                        `Must be at least ${param} characters`
                    );
            case 'max':
                return zod
                    .string()
                    .max(
                        Number.parseInt(param || '0'),
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

/*
 * validateSocialLink validates the user social url or handle using regex.
 * Validations from this function are not 100%, but they at least ensure
 * the user inputted url/handle matches a valid url/handle for a given social platform.
 */
export function validateSocialLink(
    social: Pick<UserSocial, 'platform' | 'urlOrHandle'>
): boolean {
    // special case for x/twitter
    if (social.platform === SocialPlatform.X) {
        const value = social.urlOrHandle.trim();
        
        // for empty values
        if (!value) return false;
        
        // handle full URLs properly
        if (value.startsWith('http://') || value.startsWith('https://')) {
            try {
                const url = new URL(value);
                // check if the host is exactly twitter.com
                if (url.hostname === 'twitter.com' || url.hostname === 'www.twitter.com') {
                    // extract username from path and validate it
                    const username = url.pathname.substring(1); // remove leading '/'
                    // apply the same validation rules as for handles
                    return X_USERNAME_REGEX.test(username);
                }
                return false;
            } catch {
                // invalid url format
                return false;
            }
        }
        
        // For @ handles or plain username, use the existing regex validation
        return X_USERNAME_REGEX.test(value);
    }
    
    switch (social.platform) {
        case SocialPlatform.LinkedIn:
            return LINKEDIN_PROFILE_URL_REGEX.test(social.urlOrHandle);
        case SocialPlatform.Instagram:
            return INSTAGRAM_USERNAME_REGEX.test(social.urlOrHandle);
        case SocialPlatform.Facebook:
            return FACEBOOK_PROFILE_URL_REGEX.test(social.urlOrHandle);
        case SocialPlatform.BlueSky:
            return BLUESKY_USERNAME_REGEX.test(social.urlOrHandle);
        case SocialPlatform.Discord:
            return DISCORD_USERNAME_REGEX.test(social.urlOrHandle);
        default:
            return URL_REGEX.test(social.urlOrHandle);
    }
}
