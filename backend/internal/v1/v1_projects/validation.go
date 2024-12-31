package v1_projects

/*
 * Package v1_projects provides validation utilities for project answers.
 * This file implements the validation rules and message formatting
 * for project question answers.
 */

import (
    "net/url"
    "strings"
    "strconv"
    "regexp"
)

/*
 * validationType defines a single validation rule.
 * Each validation has:
 * - Name: Rule identifier (e.g., "url", "email")
 * - Validate: Function to check if answer meets rule
 * - Message: Human-readable error message
 */
type validationType struct {
    Name      string
    Validate  func(string, string) bool  // (answer, param)
    Message   string
}

/*
 * validationTypes defines all available validation rules.
 * Each rule implements specific validation logic:
 * 
 * url: Validates URL format using url.ParseRequestURI
 * email: Checks for @ and . characters
 * phone: Verifies at least 10 numeric digits
 * min: Enforces minimum string length
 * max: Enforces maximum string length
 * regex: Matches against custom pattern
 */
var validationTypes = []validationType{
    {
        Name: "url",
        Validate: func(answer string, _ string) bool {
            _, err := url.ParseRequestURI(answer)
            return err == nil
        },
        Message: "Must be a valid URL",
    },
    {
        Name: "email",
        Validate: func(answer string, _ string) bool {
            return strings.Contains(answer, "@") && strings.Contains(answer, ".")
        },
        Message: "Must be a valid email address",
    },
    {
        Name: "phone",
        Validate: func(answer string, _ string) bool {
            cleaned := strings.Map(func(r rune) rune {
                if r >= '0' && r <= '9' {
                    return r
                }
                return -1
            }, answer)
            return len(cleaned) >= 10
        },
        Message: "Must be a valid phone number",
    },
    {
        Name: "min",
        Validate: func(answer string, param string) bool {
            minLen, err := strconv.Atoi(param)
            if err != nil {
                return false
            }
            return len(answer) >= minLen
        },
        Message: "Must be at least %s characters long",
    },
    {
        Name: "max",
        Validate: func(answer string, param string) bool {
            maxLen, err := strconv.Atoi(param)
            if err != nil {
                return false
            }
            return len(answer) <= maxLen
        },
        Message: "Must be at most %s characters long",
    },
    {
        Name: "regex",
        Validate: func(answer string, pattern string) bool {
            re, err := regexp.Compile(pattern)
            if err != nil {
                return false
            }
            return re.MatchString(answer)
        },
        Message: "Must match the required format",
    },
}

/*
 * parseValidationRule splits a validation rule string into name and parameter.
 * 
 * Examples:
 * - "min=100" returns ("min", "100")
 * - "url" returns ("url", "")
 * - "regex=^[0-9]+$" returns ("regex", "^[0-9]+$")
 */
func parseValidationRule(rule string) (name string, param string) {
    parts := strings.SplitN(rule, "=", 2)
    name = strings.TrimSpace(parts[0])
    if len(parts) > 1 {
        param = strings.TrimSpace(parts[1])
    }
    return
}

/*
 * isValidAnswer checks if an answer meets all validation rules.
 * 
 * Parameters:
 * - answer: The user's answer text
 * - validations: Comma-separated list of rules (e.g., "min=100,url")
 * 
 * Returns:
 * - true if answer passes all validations
 * - false if any validation fails
 */
func isValidAnswer(answer string, validations string) bool {
    rules := strings.Split(validations, ",")
    
    for _, rule := range rules {
        name, param := parseValidationRule(rule)
        for _, vType := range validationTypes {
            if name == vType.Name && !vType.Validate(answer, param) {
                return false
            }
        }
    }
    
    return true
}

/*
 * getValidationMessage returns human-readable error for failed validation.
 * 
 * Parameters:
 * - validations: Comma-separated list of rules
 * 
 * Returns:
 * - Formatted error message with parameters substituted
 * - Generic "Invalid input" if validation type not found
 * 
 * Example:
 * For "min=100", returns "Must be at least 100 characters long"
 */
func getValidationMessage(validations string) string {
    rules := strings.Split(validations, ",")
    
    for _, rule := range rules {
        name, param := parseValidationRule(rule)
        for _, vType := range validationTypes {
            if name == vType.Name {
                if strings.Contains(vType.Message, "%s") {
                    return strings.Replace(vType.Message, "%s", param, 1)
                }
                return vType.Message
            }
        }
    }
    
    return "Invalid input"
} 