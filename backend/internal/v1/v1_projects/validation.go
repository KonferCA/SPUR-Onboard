package v1_projects

import (
    "net/url"
    "strings"
    "strconv"
    "regexp"
)

type validationType struct {
    Name      string
    Validate  func(string, string) bool  // (answer, param)
    Message   string
}

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

func parseValidationRule(rule string) (name string, param string) {
    parts := strings.SplitN(rule, "=", 2)
    name = strings.TrimSpace(parts[0])
    if len(parts) > 1 {
        param = strings.TrimSpace(parts[1])
    }
    return
}

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