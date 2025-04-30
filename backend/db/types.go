package db

type FundingStructureModel struct {
	Type             string        `json:"type"`
	Amount           string        `json:"amount"`
	EquityPercentage string        `json:"equityPercentage"`
	MinAmount        *string       `json:"minAmount,omitempty"`
	MaxAmount        *string       `json:"maxAmount,omitempty"`
	Tiers            []FundingTier `json:"tiers,omitempty"`
	LimitInvestors   bool          `json:"limitInvestors"`
	MaxInvestors     *int32        `json:"maxInvestors,omitempty"`
}

type FundingTier struct {
	ID               string `json:"id"`
	Amount           string `json:"amount"`
	EquityPercentage string `json:"equityPercentage"`
}
