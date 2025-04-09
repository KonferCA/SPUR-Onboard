package v1_projects

import (
	"KonferCA/SPUR/db"
	"encoding/json"
	"math/big"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsValidAnswer(t *testing.T) {
	testCases := []struct {
		name        string
		answer      string
		validations []string
		expected    bool
	}{
		{
			name:        "URL validation - valid URL",
			answer:      "https://example.com",
			validations: []string{"url"},
			expected:    true,
		},
		{
			name:        "URL validation - invalid URL format",
			answer:      "example.com",
			validations: []string{"url"},
			expected:    false,
		},
		{
			name:        "URL validation - invalid URL (no https)",
			answer:      "example",
			validations: []string{"url"},
			expected:    false,
		},
		{
			name:        "Email validation - valid email",
			answer:      "test@example.com",
			validations: []string{"email"},
			expected:    true,
		},
		{
			name:        "Email validation - invalid email",
			answer:      "test@",
			validations: []string{"email"},
			expected:    false,
		},
		{
			name:        "Phone validation - valid phone",
			answer:      "123-456-7890",
			validations: []string{"phone"},
			expected:    true,
		},
		{
			name:        "Phone validation - invalid phone",
			answer:      "123-456",
			validations: []string{"phone"},
			expected:    false,
		},
		{
			name:        "Min length validation - valid length",
			answer:      "This is a long enough answer",
			validations: []string{"min=10"},
			expected:    true,
		},
		{
			name:        "Min length validation - invalid length",
			answer:      "Too short",
			validations: []string{"min=10"},
			expected:    false,
		},
		{
			name:        "Max length validation - valid length",
			answer:      "Short",
			validations: []string{"max=10"},
			expected:    true,
		},
		{
			name:        "Max length validation - invalid length",
			answer:      "This is too long for max length",
			validations: []string{"max=10"},
			expected:    false,
		},
		{
			name:        "Regex validation - valid pattern",
			answer:      "123abc",
			validations: []string{"regex=^[0-9a-z]+$"},
			expected:    true,
		},
		{
			name:        "Regex validation - invalid pattern",
			answer:      "123ABC!",
			validations: []string{"regex=^[0-9a-z]+$"},
			expected:    false,
		},
		{
			name:        "Multiple validations - all valid",
			answer:      "longtext@example.com",
			validations: []string{"min=5", "email"},
			expected:    true,
		},
		{
			name:        "Multiple validations - one invalid",
			answer:      "test@example.com",
			validations: []string{"min=20", "email"},
			expected:    false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := isValidAnswer(tc.answer, tc.validations)
			assert.Equal(t, tc.expected, result)
		})
	}
}

func TestEquityCmp(t *testing.T) {
	testCases := []struct {
		name     string
		x        string
		min      string
		max      string
		expected bool
	}{
		{
			name:     "Valid equity in range",
			x:        "50",
			min:      "0",
			max:      "100",
			expected: true,
		},
		{
			name:     "Equity equal to min",
			x:        "0",
			min:      "0",
			max:      "100",
			expected: true,
		},
		{
			name:     "Equity equal to max",
			x:        "100",
			min:      "0",
			max:      "100",
			expected: true, // Actually true based on implementation
		},
		{
			name:     "Equity below min",
			x:        "-1",
			min:      "0",
			max:      "100",
			expected: false,
		},
		{
			name:     "Equity above max",
			x:        "101",
			min:      "0",
			max:      "100",
			expected: false,
		},
		{
			name:     "Fractional equity within range",
			x:        "99.99",
			min:      "0",
			max:      "100",
			expected: true,
		},
		{
			name:     "Very small fractional equity",
			x:        "0.0001",
			min:      "0",
			max:      "100",
			expected: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Convert string values to big.Float for comparison
			x, _ := new(big.Float).SetPrec(10).SetString(tc.x)
			min, _ := new(big.Float).SetPrec(10).SetString(tc.min)
			max, _ := new(big.Float).SetPrec(10).SetString(tc.max)

			result := equityCmp(x, min, max)
			assert.Equal(t, tc.expected, result)
		})
	}
}

func TestValidateFundingStructure(t *testing.T) {
	// Define common components for the test cases
	const prec = 10
	// These precision values match what's used in the actual validation function
	_, _ = new(big.Float).SetPrec(prec).SetString("0")
	_, _ = new(big.Float).SetPrec(prec).SetString("100")

	// Helper function to create a mock question
	createFundingQuestion := func(answer string) db.GetQuestionsByProjectRow {
		return db.GetQuestionsByProjectRow{
			InputType:   db.InputTypeEnumFundingstructure,
			Answer:      answer,
			Question:    "Funding Structure",
			Required:    true,
			Validations: nil,
		}
	}

	testCases := []struct {
		name             string
		fundingStructure interface{}
		expectErrors     bool
		errorCount       int
	}{
		{
			name: "Valid target funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "target",
				EquityPercentage: "10",
				Amount:           "100000",
			},
			expectErrors: false,
		},
		{
			name: "Invalid equity percentage in target funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "target",
				EquityPercentage: "101", // Over 100%
				Amount:           "100000",
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name: "Negative amount in target funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "target",
				EquityPercentage: "10",
				Amount:           "-100", // Negative amount not allowed
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name: "Valid minimum funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "minimum",
				EquityPercentage: "10",
				MinAmount:        func() *string { s := "50000"; return &s }(),
				MaxAmount:        func() *string { s := "100000"; return &s }(),
			},
			expectErrors: false,
		},
		{
			name: "Missing min amount in minimum funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "minimum",
				EquityPercentage: "10",
				MaxAmount:        func() *string { s := "100"; return &s }(),
				MinAmount:        nil,
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name: "Missing max amount in minimum funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "minimum",
				EquityPercentage: "10",
				MaxAmount:        nil,
				MinAmount:        func() *string { s := "100"; return &s }(),
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name: "Min amount is greater than max amount in minimum funding",
			fundingStructure: db.FundingStructureModel{
				Type:             "minimum",
				EquityPercentage: "10",
				MaxAmount:        func() *string { s := "10"; return &s }(),
				MinAmount:        func() *string { s := "100"; return &s }(),
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name: "Valid tiered funding",
			fundingStructure: db.FundingStructureModel{
				Type: "tiered",
				Tiers: []db.FundingTier{
					{EquityPercentage: "5", Amount: "50000"},
					{EquityPercentage: "10", Amount: "100000"},
				},
			},
			expectErrors: false,
		},
		{
			name: "No tiers in tiered funding",
			fundingStructure: db.FundingStructureModel{
				Type:  "tiered",
				Tiers: []db.FundingTier{},
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name: "Total equity exceeds 100% in tiered funding",
			fundingStructure: db.FundingStructureModel{
				Type: "tiered",
				Tiers: []db.FundingTier{
					{EquityPercentage: "60", Amount: "50000"},
					{EquityPercentage: "50", Amount: "50000"},
				},
			},
			expectErrors: true,
			errorCount:   1,
		},
		{
			name:             "Invalid JSON",
			fundingStructure: "This is not valid JSON",
			expectErrors:     true,
			errorCount:       1,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Serialize the funding structure to JSON
			var answer string
			data, err := json.Marshal(tc.fundingStructure)
			if err == nil {
				answer = string(data)
			} else {
				// For the "Invalid JSON" test case
				answer = tc.fundingStructure.(string)
			}

			// Create a mock question with the funding structure
			question := createFundingQuestion(answer)

			// Validate the funding structure
			errors := validateProjectFormAnswers([]db.GetQuestionsByProjectRow{question})

			// Check expectations
			if tc.expectErrors {
				assert.Len(t, errors, tc.errorCount, "Expected validation errors")
			} else {
				assert.Empty(t, errors, "Expected no validation errors")
			}
		})
	}
}
