package v1_projects

/*
 * Package v1_projects provides validation utilities for project answers.
 * This file implements the validation rules and message formatting
 * for project question answers.
 */

import (
	"KonferCA/SPUR/db"
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

/*
 * validationType defines a single validation rule.
 * Each validation has:
 * - Name: Rule identifier (e.g., "url", "email")
 * - Validate: Function to check if answer meets rule
 * - Message: Human-readable error message
 */
type validationType struct {
	Validate func(string, string) bool // (answer, param)
	Message  string
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
var validationTypes = map[string]validationType{
	"url": {
		Validate: func(answer string, _ string) bool {
			// require http:// or https:// prefix for proper URL validation
			if !strings.HasPrefix(strings.ToLower(answer), "http://") &&
				!strings.HasPrefix(strings.ToLower(answer), "https://") {
				return false
			}
			_, err := url.ParseRequestURI(answer)
			return err == nil
		},
		Message: "Must be a valid URL",
	},
	"email": {
		Validate: func(answer string, _ string) bool {
			return strings.Contains(answer, "@") && strings.Contains(answer, ".")
		},
		Message: "Must be a valid email address",
	},
	"phone": {
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
	"min": {
		Validate: func(answer string, param string) bool {
			minLen, err := strconv.Atoi(param)
			if err != nil {
				return false
			}
			return len(answer) >= minLen
		},
		Message: "Must be at least %s characters long to provide sufficient detail",
	},
	"max": {
		Validate: func(answer string, param string) bool {
			maxLen, err := strconv.Atoi(param)
			if err != nil {
				return false
			}
			return len(answer) <= maxLen
		},
		Message: "Must be at most %s characters long",
	},
	"regex": {
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
func isValidAnswer(answer string, validations []string) bool {
	for _, rule := range validations {
		name, param := parseValidationRule(rule)
		vType, ok := validationTypes[name]
		if ok && !vType.Validate(answer, param) {
			return false
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
func getValidationMessage(validations []string) string {
	for _, rule := range validations {
		name, param := parseValidationRule(rule)
		vType, ok := validationTypes[name]
		if ok {
			if strings.Contains(vType.Message, "%s") {
				return strings.Replace(vType.Message, "%s", param, 1)
			}
			return vType.Message
		}
	}

	return "Invalid input"
}

// validateProjectFormAnswers is a helper function that validates all the answers in the given questions.
//
// Returns: A list of validation errors.
func validateProjectFormAnswers(questions []db.GetQuestionsByProjectRow) (validationErrors []ValidationError) {
	// Validate each question
	for _, question := range questions {
		// Check if required question is answered
		if question.Required {
			if question.ConditionType.Valid {
				// Get the dependent question's answer
				var dependentAnswer string
				var dependentChoices []string

				// Find the dependent question's answer
				for _, q := range questions {
					b := question.DependentQuestionID.Bytes
					if q.ID == fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]) {
						dependentAnswer = q.Answer
						dependentChoices = q.Choices
						break
					}
				}

				// Skip validation if condition is not met
				shouldValidate := false

				// Handle array answers (multiselect/select)
				if len(dependentChoices) > 0 {
					switch question.ConditionType.ConditionTypeEnum {
					case db.ConditionTypeEnumEmpty:
						shouldValidate = len(dependentChoices) == 0
					case db.ConditionTypeEnumNotEmpty:
						shouldValidate = len(dependentChoices) > 0
					case db.ConditionTypeEnumEquals:
						for _, choice := range dependentChoices {
							if choice == *question.ConditionValue {
								shouldValidate = true
								break
							}
						}
					case db.ConditionTypeEnumContains:
						for _, choice := range dependentChoices {
							if choice == *question.ConditionValue {
								shouldValidate = true
								break
							}
						}
					}
				} else {
					// Handle single value answers
					switch question.ConditionType.ConditionTypeEnum {
					case db.ConditionTypeEnumEmpty:
						shouldValidate = dependentAnswer == ""
					case db.ConditionTypeEnumNotEmpty:
						shouldValidate = dependentAnswer != ""
					case db.ConditionTypeEnumEquals:
						shouldValidate = dependentAnswer == *question.ConditionValue
					case db.ConditionTypeEnumContains:
						shouldValidate = strings.Contains(dependentAnswer, *question.ConditionValue)
					}
				}

				// Skip validation if condition is not met
				if !shouldValidate {
					continue
				}
			}

			switch question.InputType {
			case db.InputTypeEnumTextinput, db.InputTypeEnumTextarea:
				answer := question.Answer
				if answer == "" {
					validationErrors = append(validationErrors, ValidationError{
						Question: question.Question,
						Message:  "This question requires an answer",
					})
					continue
				}
				// Validate answer against rules if validations exist
				if question.Validations != nil {
					if !isValidAnswer(answer, question.Validations) {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  getValidationMessage(question.Validations),
						})
					}
				}
			case db.InputTypeEnumSelect, db.InputTypeEnumMultiselect:
				if len(question.Choices) < 1 {
					validationErrors = append(validationErrors, ValidationError{
						Question: question.Question,
						Message:  "This question requires an answer",
					})
					continue
				}
				if question.Validations != nil {
					for _, answer := range question.Choices {
						if !isValidAnswer(answer, question.Validations) {
							validationErrors = append(validationErrors, ValidationError{
								Question: question.Question,
								Message:  getValidationMessage(question.Validations),
							})
						}
					}
				}
			case db.InputTypeEnumFundingstructure:
				var fundingModel db.FundingStructureModel
				err := json.Unmarshal([]byte(question.Answer), &fundingModel)
				if err != nil {
					validationErrors = append(validationErrors, ValidationError{
						Question: question.Question,
						Message:  "Funding structure is not a valid JSON.",
					})
					continue
				}
				switch fundingModel.Type {
				case "target":
					equity, err := strconv.Atoi(fundingModel.EquityPercentage)
					if err != nil || equity < 1 || equity >= 100 {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure equity percentage must be 1% to 99%.",
						})
					}
					amount, err := strconv.Atoi(fundingModel.Amount)
					if err != nil || amount < 0 {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure target amount can't be less than 0.",
						})
					}
				case "minimum":
					equity, err := strconv.Atoi(fundingModel.EquityPercentage)
					if err != nil || equity < 1 || equity >= 100 {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure equity percentage must be 1% to 99%.",
						})
					}
					var minAmount int
					var maxAmount int
					if fundingModel.MinAmount == nil {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure missing minimum amount.",
						})
					} else {
						minAmount, err = strconv.Atoi(*fundingModel.MinAmount)
						if err != nil {
							validationErrors = append(validationErrors, ValidationError{
								Question: question.Question,
								Message:  "Funding structure minimum amount value is invalid.",
							})
						}
					}
					if fundingModel.MaxAmount == nil {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure missing maximum amount.",
						})
					} else {
						maxAmount, err = strconv.Atoi(*fundingModel.MaxAmount)
						if err != nil {
							validationErrors = append(validationErrors, ValidationError{
								Question: question.Question,
								Message:  "Funding structure maximum amount value is invalid.",
							})
						}
					}
					if minAmount > maxAmount {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure minimum amount can't be greater than maximum amount.",
						})
					}
				case "tiered":
					// added equity can't exceed 100
					if fundingModel.Tiers == nil || len(fundingModel.Tiers) == 0 {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Funding structure tiers missing.",
						})
					}
					totalEquity := 0
					for i, tier := range fundingModel.Tiers {
						equity, err := strconv.Atoi(tier.Amount)
						if err != nil {
							validationErrors = append(validationErrors, ValidationError{
								Question: question.Question,
								Message:  fmt.Sprintf("Funding structure tier at position %d has invalid equity percentage.", i),
							})
						}
						totalEquity += equity
					}

					if totalEquity >= 100 {
						validationErrors = append(validationErrors, ValidationError{
							Question: question.Question,
							Message:  "Tiered funding structure added equity percentage can't exceed 100%.",
						})
					}
				}
			}
		}
	}

	return validationErrors
}
