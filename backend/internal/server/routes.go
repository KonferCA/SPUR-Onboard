package server

import v1 "KonferCA/SPUR/internal/v1"

/*
Setup all the API routes of any version that will be available in this server.
*/
func (s *Server) setupRoutes() {
	v1.SetupRoutes(s)
}
