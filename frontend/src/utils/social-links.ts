import { SocialPlatform } from '@/types/auth';
import type { SocialLink } from '@/types';

/**
 * social-links.ts
 * 
 * this utility provides centralized functions for handling social media links across the application.
 * it includes functions for validation, formatting, parsing, and sanitization to prevent duplication
 * across components and ensure consistent handling of social links.
 * 
 * security considerations:
 * - all user inputs are sanitized to prevent XSS attacks
 * - url validation ensures only properly formatted urls are accepted
 * - platform-specific validation ensures data integrity
 */

// common regular expressions used for validation
export const SOCIAL_REGEX = {
  LINKEDIN: /^(https?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/?$/,
  FACEBOOK: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9\.]{5,}$/,
  INSTAGRAM: /^@?[a-zA-Z0-9\._]+$/,
  X: /^@?[a-zA-Z0-9_]{4,15}$/,
  BLUESKY: /^@?([a-zA-Z\-]{3,})\..+\..+$/,
  DISCORD: /^@?([a-z0-9\._]{2,32}$)|([a-zA-Z0-9\._]{2,32}#\d{4}$)/,
  URL: /^(https?:\/\/)?(www\.)?\w+\.\w{1,6}([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

/**
 * gets the appropriate url prefix for a social platform
 * ensures consistent format for all social links
 */
export function getSocialPrefix(platform: SocialPlatform | null): string {
  switch (platform) {
    case SocialPlatform.LinkedIn:
      return 'https://linkedin.com/in/';
    case SocialPlatform.Facebook:
      return 'https://facebook.com/';
    case SocialPlatform.Instagram:
      return 'https://instagram.com/';
    case SocialPlatform.X:
      return 'https://twitter.com/';
    case SocialPlatform.BlueSky:
      return 'https://bsky.app/profile/';
    case SocialPlatform.Discord:
      return '@';
    case SocialPlatform.CustomUrl:
      return 'https://';
    default:
      return '';
  }
}

/**
 * validate if a social link url or handle is properly formatted
 * applies platform-specific validation rules
 */
export function validateSocialLink(
  social: Pick<SocialLink, 'platform' | 'urlOrHandle'>
): boolean {
  // sanitize input to prevent xss - remove any potentially harmful characters
  const sanitizedHandle = sanitizeSocialInput(social.urlOrHandle);
  
  switch (social.platform) {
    case SocialPlatform.LinkedIn:
      return SOCIAL_REGEX.LINKEDIN.test(sanitizedHandle);
    case SocialPlatform.Facebook:
      return SOCIAL_REGEX.FACEBOOK.test(sanitizedHandle);
    case SocialPlatform.Instagram:
      return SOCIAL_REGEX.INSTAGRAM.test(sanitizedHandle);
    case SocialPlatform.X:
      return SOCIAL_REGEX.X.test(sanitizedHandle);
    case SocialPlatform.BlueSky:
      return SOCIAL_REGEX.BLUESKY.test(sanitizedHandle);
    case SocialPlatform.Discord:
      return SOCIAL_REGEX.DISCORD.test(sanitizedHandle);
    default:
      return SOCIAL_REGEX.URL.test(sanitizedHandle);
  }
}

/**
 * sanitize user input for social links to prevent xss attacks
 * removes html tags, script tags, and other potentially harmful content
 */
export function sanitizeSocialInput(input: string): string {
  // iteratively remove html tags until no more are found
  let previous;
  let sanitized = input;
  do {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } while (sanitized !== previous);
  
  // prevent javascript protocol or other script injection
  if (/^\s*javascript:/i.test(sanitized)) {
    return 'https://';
  }
  
  // escape characters that could be used for xss
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
    
  return sanitized;
}

/**
 * format a url or handle to display in a user-friendly way
 * extracts usernames from urls and formats them properly
 * safely handles parsing errors with readable fallbacks
 */
export function formatSocialDisplay(platform: SocialPlatform, urlOrHandle: string): string {
  // if it's already a handle (no url), just sanitize it
  if (!urlOrHandle.startsWith('http')) {
    return sanitizeSocialInput(urlOrHandle);
  }
  
  try {
    const url = new URL(urlOrHandle);
    
    switch (platform) {
      case SocialPlatform.X:
      case SocialPlatform.BlueSky:
      case SocialPlatform.Instagram:
      case SocialPlatform.Discord:
        // extract username from url path
        const handle = url.pathname.split('/').filter(Boolean).pop() || '';
        return '@' + sanitizeSocialInput(handle);
        
      case SocialPlatform.Facebook:
        // extract username from facebook url
        const fbHandle = url.pathname.split('/').filter(Boolean).pop() || '';
        return '@' + sanitizeSocialInput(fbHandle);
        
      case SocialPlatform.LinkedIn:
        // extract username from linkedin url
        const linkedinHandle = url.pathname.split('/').pop() || '';
        return sanitizeSocialInput(linkedinHandle);
        
      case SocialPlatform.CustomUrl:
        // show clean domain for websites
        const domain = url.hostname.replace(/^www\./, '');
        return sanitizeSocialInput(domain);
        
      default:
        return sanitizeSocialInput(urlOrHandle);
    }
  } catch (e) {
    // provide a fallback based on platform if parsing fails
    try {
      const urlParts = urlOrHandle.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      // return a logical display based on platform
      switch (platform) {
        case SocialPlatform.X:
        case SocialPlatform.BlueSky:
        case SocialPlatform.Instagram:
        case SocialPlatform.Discord:
          return lastPart ? '@' + sanitizeSocialInput(lastPart) : 'Profile Link';
        case SocialPlatform.CustomUrl:
          // try to extract domain
          const domainMatch = urlOrHandle.match(/\/\/([^\/]+)/);
          return domainMatch ? sanitizeSocialInput(domainMatch[1]) : 'Web Link';
        default:
          return 'Profile Link';
      }
    } catch (fallbackError) {
      // last resort
      console.warn('Failed to parse social link:', urlOrHandle, fallbackError);
      return platform === SocialPlatform.CustomUrl ? 'Web Link' : 'Profile Link';
    }
  }
}

/**
 * converts social links from backend format to frontend format
 * used when retrieving data from the api
 */
export function processSocialLinksFromApi(socialLinks: Array<{platform: string, url_or_handle: string}> = []): SocialLink[] {
  if (!socialLinks || !Array.isArray(socialLinks)) return [];
  
  return socialLinks.map(link => ({
    id: Math.random().toString(36).substring(2, 9),
    platform: link.platform as SocialPlatform,
    urlOrHandle: sanitizeSocialInput(link.url_or_handle)
  }));
}

/**
 * converts social links from frontend format to backend format
 * used when sending data to the api
 */
export function processSocialLinksForApi(socialLinks: SocialLink[] = []): Array<{platform: string, url_or_handle: string}> {
  if (!socialLinks || !Array.isArray(socialLinks)) return [];
  
  return socialLinks.map(link => ({
    platform: link.platform,
    url_or_handle: sanitizeSocialInput(link.urlOrHandle)
  }));
} 