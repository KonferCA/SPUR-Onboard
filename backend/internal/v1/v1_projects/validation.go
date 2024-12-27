package v1_projects

import (
    "net/url"
    "strings"
)

type validationType struct {
    Name      string
    Validate  func(string) bool
    Message   string
}

var validationTypes = []validationType{
    {
        Name: "url",
        Validate: func(answer string) bool {
            _, err := url.ParseRequestURI(answer)
            return err == nil
        },
        Message: "Must be a valid URL",
    },
    {
        Name: "email",
        Validate: func(answer string) bool {
            return strings.Contains(answer, "@") && strings.Contains(answer, ".")
        },
        Message: "Must be a valid email address",
    },
    {
        Name: "phone",
        Validate: func(answer string) bool {
            // Simple check for now - frontend will do proper formatting lol
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
}

func isValidAnswer(answer string, validations string) bool {
    rules := strings.Split(validations, ",")
    
    for _, rule := range rules {
        for _, vType := range validationTypes {
            if rule == vType.Name && !vType.Validate(answer) {
                return false
            }
        }
    }
    
    return true
}

func getValidationMessage(validations string) string {
    rules := strings.Split(validations, ",")
    
    for _, rule := range rules {
        for _, vType := range validationTypes {
            if rule == vType.Name {
                return vType.Message
            }
        }
    }
    
    return "Invalid input"
} 