import { SocialPlatform } from '@/types/auth';

export function getErrorMsg(platform: SocialPlatform | null): string {
    switch (platform) {
        case SocialPlatform.Discord:
            return 'Please enter a valid Discord username. I.E: example.username or example#0001';
        case SocialPlatform.X:
            return 'Please enter a valid X handle. I.E: example_handle';
        case SocialPlatform.Instagram:
            return 'Please enter a valid Instagram username. I.E: example.username';
        case SocialPlatform.Facebook:
            return 'Please enter a valid Facebook profile URL. I.E: www.facebook.com/username';
        case SocialPlatform.BlueSky:
            return 'Please enter a valid Bluesky handle. I.E: example.bluesky.com';
        case SocialPlatform.LinkedIn:
            return 'Please enter a valid LinkedIn profile URL. I.E: www.linkedin.com/in/username';
        case SocialPlatform.CustomUrl:
            return 'Please enter a valid URL. I.E: www.custom.com';
        default:
            break;
    }
    return '';
}

export function getSocialPrefix(platform: SocialPlatform | null): string {
    let prefix = '';
    switch (platform) {
        case SocialPlatform.Discord:
        case SocialPlatform.X:
        case SocialPlatform.Instagram:
        case SocialPlatform.BlueSky:
            prefix = '@';
            break;
        case SocialPlatform.LinkedIn:
        case SocialPlatform.Facebook:
        case SocialPlatform.CustomUrl:
            prefix = 'https://';
            break;
        default:
            break;
    }
    return prefix;
}

export function getSocialInputPlaceholder(
    platform: SocialPlatform | null
): string {
    let placeholder = '';
    switch (platform) {
        case SocialPlatform.Discord:
            placeholder = 'mydiscord';
            break;
        case SocialPlatform.X:
            placeholder = 'example_handle';
            break;
        case SocialPlatform.Instagram:
            placeholder = 'example.username';
            break;
        case SocialPlatform.LinkedIn:
            placeholder = 'www.linkedin.com/in/';
            break;
        case SocialPlatform.Facebook:
            placeholder = 'www.facebook.com/';
            break;
        case SocialPlatform.BlueSky:
            placeholder = 'example.bluesky.com';
            break;
        case SocialPlatform.CustomUrl:
            placeholder = 'www.example.com';
            break;
        default:
            break;
    }
    return placeholder;
}

export function getSocialInputLabel(platform: SocialPlatform | null): string {
    let label = '';
    switch (platform) {
        case SocialPlatform.Discord:
            label = 'Discord Username';
            break;
        case SocialPlatform.X:
            label = 'X Handle';
            break;
        case SocialPlatform.Instagram:
            label = 'Instagram Username';
            break;
        case SocialPlatform.Facebook:
        case SocialPlatform.LinkedIn:
            label = 'Profile URL';
            break;
        case SocialPlatform.BlueSky:
            label = 'Bluesky Handle';
            break;
        case SocialPlatform.CustomUrl:
            label = 'Custom URL';
            break;
        default:
            break;
    }
    return label;
}
