-- name: CreateCompanyDocument :one
INSERT INTO company_documents (
    company_id,
    document_type,
    file_url
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: GetCompanyDocumentByID :one
SELECT * FROM company_documents
WHERE id = $1 LIMIT 1;

-- name: ListCompanyDocuments :many
SELECT * FROM company_documents
WHERE company_id = $1
ORDER BY created_at DESC;

-- name: ListDocumentsByType :many
SELECT * FROM company_documents
WHERE company_id = $1 AND document_type = $2
ORDER BY created_at DESC;

-- name: UpdateCompanyDocument :one
UPDATE company_documents
SET 
    document_type = $2,
    file_url = $3,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteCompanyDocument :exec
DELETE FROM company_documents
WHERE id = $1;