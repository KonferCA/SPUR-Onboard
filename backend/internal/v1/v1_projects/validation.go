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
	"math/big"
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
		// Skip non-required questions
		if !question.Required {
			continue
		}

		// Check if question has conditional validation
		if question.ConditionType.Valid {
			// Skip validation if condition is not met
			if !shouldValidateQuestion(question, questions) {
				continue
			}
		}

		// Validate based on input type
		switch question.InputType {
		case db.InputTypeEnumTextinput, db.InputTypeEnumTextarea:
			validationErrors = append(validationErrors, validateTextInput(question)...)
		case db.InputTypeEnumSelect, db.InputTypeEnumMultiselect:
			validationErrors = append(validationErrors, validateChoiceInput(question)...)
		case db.InputTypeEnumFundingstructure:
			validationErrors = append(validationErrors, validateFundingStructure(question)...)
		}
	}

	return validationErrors
}

// shouldValidateQuestion determines if a question should be validated based on its conditions.
func shouldValidateQuestion(question db.GetQuestionsByProjectRow, questions []db.GetQuestionsByProjectRow) bool {
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

	// Handle array answers (multiselect/select)
	if len(dependentChoices) > 0 {
		return checkChoiceCondition(question, dependentChoices)
	}

	// Handle single value answers
	return checkTextCondition(question, dependentAnswer)
}

// checkChoiceCondition checks if a condition is met for choice-based answers.
func checkChoiceCondition(question db.GetQuestionsByProjectRow, choices []string) bool {
	switch question.ConditionType.ConditionTypeEnum {
	case db.ConditionTypeEnumEmpty:
		return len(choices) == 0
	case db.ConditionTypeEnumNotEmpty:
		return len(choices) > 0
	case db.ConditionTypeEnumEquals, db.ConditionTypeEnumContains:
		for _, choice := range choices {
			if choice == *question.ConditionValue {
				return true
			}
		}
	}
	return false
}

// checkTextCondition checks if a condition is met for text-based answers.
func checkTextCondition(question db.GetQuestionsByProjectRow, answer string) bool {
	switch question.ConditionType.ConditionTypeEnum {
	case db.ConditionTypeEnumEmpty:
		return answer == ""
	case db.ConditionTypeEnumNotEmpty:
		return answer != ""
	case db.ConditionTypeEnumEquals:
		return answer == *question.ConditionValue
	case db.ConditionTypeEnumContains:
		return strings.Contains(answer, *question.ConditionValue)
	}
	return false
}

// validateTextInput validates text and textarea inputs.
func validateTextInput(question db.GetQuestionsByProjectRow) []ValidationError {
	var errors []ValidationError

	answer := question.Answer
	if answer == "" {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "This question requires an answer",
		})
	}

	// Validate answer against rules if validations exist
	if question.Validations != nil && !isValidAnswer(answer, question.Validations) {
		errors = append(errors, ValidationError{
			Question: question.Question,
			Message:  getValidationMessage(question.Validations),
		})
	}

	return errors
}

// validateChoiceInput validates select and multiselect inputs.
func validateChoiceInput(question db.GetQuestionsByProjectRow) []ValidationError {
	var errors []ValidationError

	if len(question.Choices) < 1 {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "This question requires an answer",
		})
	}

	if question.Validations != nil {
		for _, answer := range question.Choices {
			if !isValidAnswer(answer, question.Validations) {
				errors = append(errors, ValidationError{
					Question: question.Question,
					Message:  getValidationMessage(question.Validations),
				})
			}
		}
	}

	return errors
}

// validateFundingStructure validates funding structure inputs.
func validateFundingStructure(question db.GetQuestionsByProjectRow) []ValidationError {
	var errors []ValidationError

	// Parse funding structure model
	var fundingModel db.FundingStructureModel
	err := json.Unmarshal([]byte(question.Answer), &fundingModel)
	if err != nil {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure is not a valid JSON.",
		})
	}

	const prec = 10
	zero, _ := new(big.Float).SetPrec(prec).SetString("0")
	hundred, _ := new(big.Float).SetPrec(prec).SetString("100")

	// Validate based on funding type
	switch fundingModel.Type {
	case "target":
		errors = append(errors, validateTargetFunding(question, fundingModel, zero, hundred)...)
	case "minimum":
		errors = append(errors, validateMinimumFunding(question, fundingModel, zero, hundred)...)
	case "tiered":
		errors = append(errors, validateTieredFunding(question, fundingModel, zero, hundred)...)
	}

	return errors
}

// validateTargetFunding validates the target funding structure type.
func validateTargetFunding(question db.GetQuestionsByProjectRow, model db.FundingStructureModel,
	zero, hundred *big.Float) []ValidationError {
	var errors []ValidationError

	// Validate equity percentage
	equity, success := new(big.Float).SetPrec(10).SetString(model.EquityPercentage)
	if !success || !equityCmp(equity, zero, hundred) {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure equity percentage must be 1% to 99%.",
		})
	}

	// Validate amount
	amount, success := new(big.Float).SetPrec(10).SetString(model.Amount)
	if !success || amount.Cmp(zero) == -1 {
		errors = append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure target amount can't be less than 0.",
		})
	}

	return errors
}

// validateMinimumFunding validates the minimum funding structure type.
func validateMinimumFunding(question db.GetQuestionsByProjectRow, model db.FundingStructureModel,
	zero, hundred *big.Float) []ValidationError {
	var errors []ValidationError

	// Validate equity percentage
	equity, success := new(big.Float).SetPrec(10).SetString(model.EquityPercentage)
	if !success || !equityCmp(equity, zero, hundred) {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure equity percentage must be 1% to 99%.",
		})
	}

	// Validate minimum amount
	var minAmount *big.Float
	if model.MinAmount == nil {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure missing minimum amount.",
		})
	}

	minAmount, success = new(big.Float).SetPrec(10).SetString(*model.MinAmount)
	if !success {
		errors = append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure minimum amount value is invalid.",
		})
	}

	// Validate maximum amount
	var maxAmount *big.Float
	if model.MaxAmount == nil {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure missing maximum amount.",
		})
	}

	maxAmount, success = new(big.Float).SetPrec(10).SetString(*model.MaxAmount)
	if !success {
		errors = append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure maximum amount value is invalid.",
		})
	}

	// Validate min/max relationship
	if minAmount != nil && maxAmount != nil && minAmount.Cmp(maxAmount) == 1 {
		errors = append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure minimum amount can't be greater than maximum amount.",
		})
	}

	return errors
}

// validateTieredFunding validates the tiered funding structure type.
func validateTieredFunding(question db.GetQuestionsByProjectRow, model db.FundingStructureModel,
	zero, hundred *big.Float) []ValidationError {
	var errors []ValidationError

	// Check if tiers exist
	if model.Tiers == nil || len(model.Tiers) == 0 {
		return append(errors, ValidationError{
			Question: question.Question,
			Message:  "Funding structure tiers missing.",
		})
	}

	// Calculate total equity
	totalEquity := new(big.Float).Copy(zero)
	for i, tier := range model.Tiers {
		equity, success := new(big.Float).SetPrec(10).SetString(tier.EquityPercentage)
		if !success {
			errors = append(errors, ValidationError{
				Question: question.Question,
				Message:  fmt.Sprintf("Funding structure tier at position %d has invalid equity percentage: not a correct decimal number.", i),
			})
			continue
		}

		// Validate the equity at each tier to be in acceptable range
		if !equityCmp(equity, zero, hundred) {
			errors = append(errors, ValidationError{
				Question: question.Question,
				Message:  fmt.Sprintf("Funding structure tier at position %d has invalid equity percentage: equity must be greater than 0% but less than 100%.", i),
			})
			continue
		}

		// Validate the amount at each tier to be non-negative
		amount, success := new(big.Float).SetPrec(10).SetString(tier.Amount)
		if !success {
			errors = append(errors, ValidationError{
				Question: question.Question,
				Message:  fmt.Sprintf("Funding structure tier at position %d has invalid amount: not a correct decimal number", i),
			})
			continue
		}

		if !greaterThan(amount, zero) {
			errors = append(errors, ValidationError{
				Question: question.Question,
				Message:  fmt.Sprintf("Funding structure tier at position %d has invalid amount: the value must be greater than 0.", i),
			})
			continue
		}

		// Add tier equity to total equity
		// Action performed last after making sure that both equity and amount are valid
		totalEquity = totalEquity.Add(totalEquity, equity)
	}

	// Validate total equity doesn't exceed 100%
	if totalEquity.Cmp(hundred) > 0 {
		errors = append(errors, ValidationError{
			Question: question.Question,
			Message:  "Tiered funding structure added equity percentage can't exceed 100%.",
		})
	}

	return errors
}

// equityCmp does a check against x value to be between min (inclusive) and max (exclusive)
func equityCmp(x, min, max *big.Float) bool {
	return greaterThan(x, min) && lessThan(x, max)
}

// greaterThan is a helper function that checks if a is greater than b.
func greaterThan(a, b *big.Float) bool {
	return a.Cmp(b) == 1
}

// lessThan is a helper function that checks if a is less than b.
func lessThan(a, b *big.Float) bool {
	return a.Cmp(b) == -1
}
