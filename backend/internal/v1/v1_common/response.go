package v1_common

/*
Use this for any json response that just needs a simple message field.
*/
type basicResponse struct {
	Message string `json:"message"`
}
