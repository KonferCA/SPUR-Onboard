package v1common

/*
Use this for any json response that just needs a simple message field.
*/
type basicOkResponse struct {
	Message string `json:"message"`
}

/*
Use this for any request that resulted in a failure state.
This includes any response that was not a 200 or 300 level codes.
*/
type basicErrResponse struct {
	Message   string `json:"message"`
	RequestId string `json:"request_id"`
}
