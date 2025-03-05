package v1_transactions

import "KonferCA/SPUR/internal/interfaces"

type Handler struct {
    server interfaces.CoreServer
}

type CreateTransactionRequest struct {
    ProjectID   string `json:"project_id" validate:"required,uuid4"`
    TxHash      string `json:"tx_hash" validate:"required,wallet_address"`
    FromAddress string `json:"from_address" validate:"required,wallet_address"`
    ToAddress   string `json:"to_address" validate:"required,wallet_address"`
    ValueAmount string `json:"value_amount" validate:"required,numeric"`
}

type TransactionResponse struct {
    ID          string `json:"id"`
    ProjectID   string `json:"project_id"`
    CompanyID   string `json:"company_id"`
    TxHash      string `json:"tx_hash"`
    FromAddress string `json:"from_address"`
    ToAddress   string `json:"to_address"`
    ValueAmount string `json:"value_amount"`
    CreatedBy   string `json:"created_by"`
}
