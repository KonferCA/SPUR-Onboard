package v1_common

import (
	"KonferCA/SPUR/db"
	"bytes"
	"encoding/json"
	"net/url"
	"strings"
)

// SocialLink represents a social media platform link
type SocialLink struct {
	Platform    db.SocialPlatformEnum `json:"platform"`
	UrlOrHandle string                `json:"url_or_handle"`
}

// ProcessSocialLinks converts database TeamMember social_links to a structured format
// Returns the array of social links only
func ProcessSocialLinks(member db.TeamMember) []SocialLink {
	// Extract social links from the raw data
	var socialLinks []SocialLink
	if member.SocialLinks != nil && len(member.SocialLinks) > 0 {
		// Only try to unmarshal if not the empty array placeholder
		if !bytes.Equal(member.SocialLinks, []byte("[]")) && !bytes.Equal(member.SocialLinks, []byte("null")) {
			if err := json.Unmarshal(member.SocialLinks, &socialLinks); err != nil {
				// Return empty array on error
				socialLinks = []SocialLink{}
			}
		}
	}

	return socialLinks
}

// ProcessSocialLinksRequest processes social links from API request
// Returns the array as JSON for database storage
func ProcessSocialLinksRequest(socialLinks []SocialLink) ([]byte, error) {
	// Validate social links
	validatedLinks := make([]SocialLink, 0, len(socialLinks))

	for _, link := range socialLinks {
		// Ensure platform is valid
		if !isValidPlatform(link.Platform) {
			continue
		}

		// Sanitize URL/handle based on platform
		sanitizedUrl, valid := sanitizeUrlOrHandle(link.Platform, link.UrlOrHandle)
		if !valid {
			continue
		}

		validatedLinks = append(validatedLinks, SocialLink{
			Platform:    link.Platform,
			UrlOrHandle: sanitizedUrl,
		})
	}

	// Marshal to JSON
	return json.Marshal(validatedLinks)
}

// isValidPlatform checks if the given platform is a valid social platform enum
func isValidPlatform(platform db.SocialPlatformEnum) bool {
	switch platform {
	case db.SocialPlatformEnumLinkedin,
		db.SocialPlatformEnumInstagram,
		db.SocialPlatformEnumFacebook,
		db.SocialPlatformEnumBluesky,
		db.SocialPlatformEnumX,
		db.SocialPlatformEnumDiscord,
		db.SocialPlatformEnumCustomUrl:
		return true
	}
	return false
}

// sanitizeUrlOrHandle sanitizes and validates the URL or handle for the given platform
func sanitizeUrlOrHandle(platform db.SocialPlatformEnum, urlOrHandle string) (string, bool) {
	// Trim whitespace from the URL/handle
	urlOrHandle = strings.TrimSpace(urlOrHandle)

	// If empty after trimming, it's invalid
	if urlOrHandle == "" {
		return "", false
	}

	// Handle platform-specific validation and sanitization
	switch platform {
	case db.SocialPlatformEnumLinkedin:
		// LinkedIn URLs should start with https://www.linkedin.com/
		if strings.HasPrefix(urlOrHandle, "https://") || strings.HasPrefix(urlOrHandle, "http://") {
			return urlOrHandle, isValidUrl(urlOrHandle) && strings.Contains(urlOrHandle, "linkedin.com")
		}
		return "https://www.linkedin.com/" + urlOrHandle, true

	case db.SocialPlatformEnumFacebook:
		// Facebook URLs should start with https://www.facebook.com/
		if strings.HasPrefix(urlOrHandle, "https://") || strings.HasPrefix(urlOrHandle, "http://") {
			return urlOrHandle, isValidUrl(urlOrHandle) && strings.Contains(urlOrHandle, "facebook.com")
		}
		return "https://www.facebook.com/" + urlOrHandle, true

	case db.SocialPlatformEnumInstagram:
		// Instagram handles may start with @
		if strings.HasPrefix(urlOrHandle, "@") {
			urlOrHandle = urlOrHandle[1:]
		}
		if strings.HasPrefix(urlOrHandle, "https://") || strings.HasPrefix(urlOrHandle, "http://") {
			return urlOrHandle, isValidUrl(urlOrHandle) && strings.Contains(urlOrHandle, "instagram.com")
		}
		return "https://www.instagram.com/" + urlOrHandle, true

	case db.SocialPlatformEnumX:
		// X/Twitter handles may start with @
		if strings.HasPrefix(urlOrHandle, "@") {
			urlOrHandle = urlOrHandle[1:]
		}
		if strings.HasPrefix(urlOrHandle, "https://") || strings.HasPrefix(urlOrHandle, "http://") {
			return urlOrHandle, isValidUrl(urlOrHandle) && (strings.Contains(urlOrHandle, "twitter.com") || strings.Contains(urlOrHandle, "x.com"))
		}
		return "https://twitter.com/" + urlOrHandle, true

	case db.SocialPlatformEnumBluesky:
		// Bluesky handles may start with @
		if strings.HasPrefix(urlOrHandle, "@") {
			urlOrHandle = urlOrHandle[1:]
		}
		if strings.HasPrefix(urlOrHandle, "https://") || strings.HasPrefix(urlOrHandle, "http://") {
			return urlOrHandle, isValidUrl(urlOrHandle) && strings.Contains(urlOrHandle, "bsky.app")
		}
		return "https://bsky.app/profile/" + urlOrHandle, true

	case db.SocialPlatformEnumDiscord:
		// Discord handles can start w/ @
		if strings.HasPrefix(urlOrHandle, "@") {
			urlOrHandle = urlOrHandle[1:]
		}
		// Discord handles don't have a standard URL format, so we just validate that it's not empty lol
		return urlOrHandle, true

	case db.SocialPlatformEnumCustomUrl:
		// For custom URLs, ensure it's a valid URL
		if strings.HasPrefix(urlOrHandle, "https://") || strings.HasPrefix(urlOrHandle, "http://") {
			return urlOrHandle, isValidUrl(urlOrHandle)
		}
		return "https://" + urlOrHandle, isValidUrl("https://" + urlOrHandle)

	default:
		return urlOrHandle, false
	}
}

// isValidUrl checks if the given string is a valid URL
func isValidUrl(urlStr string) bool {
	u, err := url.ParseRequestURI(urlStr)
	if err != nil {
		return false
	}

	// ensure url has a valid host
	if u.Host == "" {
		return false
	}

	// ensure url is using http or https
	if u.Scheme != "http" && u.Scheme != "https" {
		return false
	}

	// additional check for common phishing patterns
	if strings.Contains(u.Host, "--") || strings.Count(u.Host, ".") > 5 {
		return false
	}

	return true
}
