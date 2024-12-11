package server

import (
	"fmt"
	"net/http"
	"os"
	"reflect"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"

	"KonferCA/SPUR/common"
	"KonferCA/SPUR/db"
	"KonferCA/SPUR/internal/jwt"
	"KonferCA/SPUR/internal/middleware"
	"KonferCA/SPUR/storage"
)

type Server struct {
	DBPool       *pgxpool.Pool
	queries      *db.Queries
	echoInstance *echo.Echo
	apiV1        *echo.Group
	authLimiter  *middleware.RateLimiter
	apiLimiter   *middleware.RateLimiter
	Storage      *storage.Storage
}

// Create a new Server instance and registers all routes and middlewares.
// Initialize database pool connection.
func New(testing bool) (*Server, error) {
	var dbPool *pgxpool.Pool
	var queries *db.Queries
	var storageClient *storage.Storage
	var err error

	// format connection string
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	// initialize database connection using pool.go
	dbPool, err = db.NewPool(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}
	queries = db.New(dbPool)

	if !testing {
		// Initialize storage only for non-test environment
		storageClient, err = storage.NewStorage()
		if err != nil {
			return nil, fmt.Errorf("failed to initialize storage: %v", err)
		}
	}

	e := echo.New()
	e.Debug = true

	// create rate limiters
	var authLimiter, apiLimiter *middleware.RateLimiter

	if testing {
		authLimiter = middleware.NewTestRateLimiter(20)
		apiLimiter = middleware.NewTestRateLimiter(100)
	} else {
		authLimiter = middleware.NewRateLimiter(
			20,             // 20 requests
			5*time.Minute,  // per 5 minutes
			15*time.Minute, // block for 15 minutes if exceeded
		)
		apiLimiter = middleware.NewRateLimiter(
			100,           // 100 requests
			time.Minute,   // per minute
			5*time.Minute, // block for 5 minutes if exceeded
		)
	}

	server := &Server{
		DBPool:       dbPool,
		queries:      queries,
		echoInstance: e,
		authLimiter:  authLimiter,
		apiLimiter:   apiLimiter,
		Storage:      storageClient,
	}

	// setup api routes first
	server.setupV1Routes()
	server.setupAuthRoutes()
	server.setupCompanyRoutes()
	server.setupResourceRequestRoutes()
	server.setupCompanyFinancialRoutes()
	server.setupEmployeeRoutes()
	server.setupCompanyDocumentRoutes()
	server.setupCompanyQuestionsAnswersRoutes()
	server.setupProjectRoutes()
	server.setupTagRoutes()
	server.setupFundingTransactionRoutes()
	server.setupMeetingRoutes()
	server.setupHealthRoutes()
	server.setupStorageRoutes()

	// setup error handler and middlewares after routes
	e.HTTPErrorHandler = globalErrorHandler

	// setup cors based on environment
	if os.Getenv("APP_ENV") == common.PRODUCTION_ENV {
		e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
			AllowOrigins: []string{"https://spur.konfer.ca"},
			AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
			AllowHeaders: []string{
				echo.HeaderOrigin,
				echo.HeaderContentType,
				echo.HeaderAccept,
				echo.HeaderContentLength,
				echo.HeaderAuthorization,
				"X-Request-ID",
			},
			AllowCredentials: true,
			ExposeHeaders: []string{
				"Set-Cookie",
			},
		}))
	} else if os.Getenv("APP_ENV") == common.STAGING_ENV {
		e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
			AllowOrigins: []string{"https://nk-preview.konfer.ca"},
			AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
			AllowHeaders: []string{
				echo.HeaderOrigin,
				echo.HeaderContentType,
				echo.HeaderAccept,
				echo.HeaderContentLength,
				echo.HeaderAuthorization,
				"X-Request-ID",
			},
			AllowCredentials: true,
			ExposeHeaders: []string{
				"Set-Cookie",
			},
		}))
	} else {
		// development environment
		e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
			AllowOrigins: []string{"http://localhost:5173"},
			AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
			AllowHeaders: []string{
				echo.HeaderOrigin,
				echo.HeaderContentType,
				echo.HeaderAccept,
				echo.HeaderContentLength,
				echo.HeaderAuthorization,
				"X-Request-ID",
			},
			AllowCredentials: true,
			ExposeHeaders: []string{
				"Set-Cookie",
			},
		}))
	}

	e.Use(middleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(apiLimiter.RateLimit()) // global rate limit

	customValidator := middleware.NewRequestBodyValidator()
	e.Validator = customValidator

	// setup static routes last
	server.setupStaticRoutes()

	return server, nil
}

func (s *Server) setupV1Routes() {
	s.apiV1 = s.echoInstance.Group("/api/v1")

	fmt.Println("Registered routes:")
	for _, route := range s.echoInstance.Routes() {
		fmt.Printf("Route: %s %s\n", route.Method, route.Path)
	}
}

func (s *Server) setupCompanyRoutes() {
	s.apiV1.POST("/companies", s.handleCreateCompany, middleware.ValidateRequestBody(reflect.TypeOf(CreateCompanyRequest{})))
	s.apiV1.GET("/companies/:id", s.handleGetCompany)
	s.apiV1.GET("/companies", s.handleListCompanies)
	s.apiV1.DELETE("/companies/:id", s.handleDeleteCompany)
}

func (s *Server) setupResourceRequestRoutes() {
	s.apiV1.POST("/resource-requests", s.handleCreateResourceRequest, middleware.ValidateRequestBody(reflect.TypeOf(CreateResourceRequestRequest{})))
	s.apiV1.GET("/resource-requests/:id", s.handleGetResourceRequest)
	s.apiV1.GET("/resource-requests", s.handleListResourceRequests)
	s.apiV1.PUT("/resource-requests/:id/status", s.handleUpdateResourceRequestStatus, middleware.ValidateRequestBody(reflect.TypeOf(UpdateResourceRequestStatusRequest{})))
	s.apiV1.DELETE("/resource-requests/:id", s.handleDeleteResourceRequest)
}

func (s *Server) setupCompanyFinancialRoutes() {
	s.apiV1.POST("/companies/:id/financials", s.handleCreateCompanyFinancials, middleware.ValidateRequestBody(reflect.TypeOf(CreateCompanyFinancialsRequest{})))
	s.apiV1.GET("/companies/:id/financials", s.handleGetCompanyFinancials)
	s.apiV1.PUT("/companies/:id/financials", s.handleUpdateCompanyFinancials, middleware.ValidateRequestBody(reflect.TypeOf(CreateCompanyFinancialsRequest{})))
	s.apiV1.DELETE("/companies/:id/financials", s.handleDeleteCompanyFinancials)
	s.apiV1.GET("/companies/:id/financials/latest", s.handleGetLatestCompanyFinancials)
}

func (s *Server) setupEmployeeRoutes() {
	s.apiV1.POST("/employees", s.handleCreateEmployee, middleware.ValidateRequestBody(reflect.TypeOf(CreateEmployeeRequest{})))
	s.apiV1.GET("/employees", s.handleListEmployees)
	s.apiV1.GET("/employees/:id", s.handleGetEmployee)
	s.apiV1.PUT("/employees/:id", s.handleUpdateEmployee, middleware.ValidateRequestBody(reflect.TypeOf(UpdateEmployeeRequest{})))
	s.apiV1.DELETE("/employees/:id", s.handleDeleteEmployee)
}

func (s *Server) setupCompanyDocumentRoutes() {
	s.apiV1.POST("/companies/:id/documents", s.handleCreateCompanyDocument, middleware.ValidateRequestBody(reflect.TypeOf(CreateCompanyDocumentRequest{})))
	s.apiV1.GET("/companies/:id/documents", s.handleListCompanyDocuments)
	s.apiV1.GET("/documents/:id", s.handleGetCompanyDocument)
	s.apiV1.PUT("/documents/:id", s.handleUpdateCompanyDocument, middleware.ValidateRequestBody(reflect.TypeOf(UpdateCompanyDocumentRequest{})))
	s.apiV1.DELETE("/documents/:id", s.handleDeleteCompanyDocument)
}

func (s *Server) setupCompanyQuestionsAnswersRoutes() {
	s.apiV1.POST("/questions", s.handleCreateQuestion, middleware.ValidateRequestBody(reflect.TypeOf(CreateQuestionRequest{})))
	s.apiV1.GET("/questions", s.handleListQuestions)
	s.apiV1.GET("/questions/:id", s.handleGetQuestion)
	s.apiV1.DELETE("/questions/:id", s.handleDeleteQuestion)

	s.apiV1.POST("/companies/:id/answers", s.handleCreateCompanyAnswer, middleware.ValidateRequestBody(reflect.TypeOf(CreateCompanyAnswerRequest{})))
	s.apiV1.GET("/companies/:id/answers", s.handleListCompanyAnswers)
	s.apiV1.GET("/answers/:id", s.handleGetCompanyAnswer)
	s.apiV1.PUT("/answers/:id", s.handleUpdateCompanyAnswer, middleware.ValidateRequestBody(reflect.TypeOf(UpdateCompanyAnswerRequest{})))
	s.apiV1.DELETE("/answers/:id", s.handleDeleteCompanyAnswer)
}

func (s *Server) setupProjectRoutes() {
    // create projects group
    projects := s.apiV1.Group("/projects")
    
    // protect all project routes with JWT authentication
    projects.Use(middleware.ProtectAPI(jwt.ACCESS_TOKEN_TYPE, s.queries))

    // setup routes
    projects.POST("", s.handleCreateProject, middleware.ValidateRequestBody(reflect.TypeOf(CreateProjectRequest{})))
    projects.GET("", s.handleListProjects)
    projects.GET("/:id", s.handleGetProject)
    projects.PUT("/:id", s.handleUpdateProject, middleware.ValidateRequestBody(reflect.TypeOf(UpdateProjectRequest{})))
    projects.DELETE("/:id", s.handleDeleteProject)
    
    // project files
    projects.POST("/:id/files", s.handleCreateProjectFile)
    projects.GET("/:id/files", s.handleListProjectFiles)
    projects.DELETE("/files/:id", s.handleDeleteProjectFile)
    
    // project comments
    projects.POST("/:id/comments", s.handleCreateProjectComment, middleware.ValidateRequestBody(reflect.TypeOf(CreateProjectCommentRequest{})))
    projects.GET("/:id/comments", s.handleListProjectComments)
    projects.DELETE("/comments/:id", s.handleDeleteProjectComment)
    
    // project links
    projects.POST("/:id/links", s.handleCreateProjectLink, middleware.ValidateRequestBody(reflect.TypeOf(CreateProjectLinkRequest{})))
    projects.GET("/:id/links", s.handleListProjectLinks)
    projects.DELETE("/links/:id", s.handleDeleteProjectLink)
    
    // project tags
    projects.POST("/:id/tags", s.handleAddProjectTag, middleware.ValidateRequestBody(reflect.TypeOf(AddProjectTagRequest{})))
    projects.GET("/:id/tags", s.handleListProjectTags)
    projects.DELETE("/:id/tags/:tag_id", s.handleDeleteProjectTag)
}

func (s *Server) setupTagRoutes() {
	s.apiV1.POST("/tags", s.handleCreateTag, middleware.ValidateRequestBody(reflect.TypeOf(CreateTagRequest{})))
	s.apiV1.GET("/tags/:id", s.handleGetTag)
	s.apiV1.GET("/tags", s.handleListTags)
	s.apiV1.DELETE("/tags/:id", s.handleDeleteTag)
}

func (s *Server) setupFundingTransactionRoutes() {
	s.apiV1.POST("/funding-transactions", s.handleCreateFundingTransaction, middleware.ValidateRequestBody(reflect.TypeOf(CreateFundingTransactionRequest{})))
	s.apiV1.GET("/funding-transactions/:id", s.handleGetFundingTransaction)
	s.apiV1.GET("/funding-transactions", s.handleListFundingTransactions)
	s.apiV1.PUT("/funding-transactions/:id/status", s.handleUpdateFundingTransactionStatus, middleware.ValidateRequestBody(reflect.TypeOf(UpdateFundingTransactionStatusRequest{})))
	s.apiV1.DELETE("/funding-transactions/:id", s.handleDeleteFundingTransaction)
}

func (s *Server) setupMeetingRoutes() {
	s.apiV1.POST("/meetings", s.handleCreateMeeting, middleware.ValidateRequestBody(reflect.TypeOf(CreateMeetingRequest{})))
	s.apiV1.GET("/meetings/:id", s.handleGetMeeting)
	s.apiV1.GET("/meetings", s.handleListMeetings)
	s.apiV1.PUT("/meetings/:id", s.handleUpdateMeeting, middleware.ValidateRequestBody(reflect.TypeOf(UpdateMeetingRequest{})))
	s.apiV1.DELETE("/meetings/:id", s.handleDeleteMeeting)
}

func (s *Server) setupHealthRoutes() {
	s.apiV1.GET("/health", s.handleHealthCheck)
}

// Start listening at the given address.
//
// Example:
//
// s := server.New()
// log.Fatal(s.Listen(":8080")) // listen on port 8080
func (s *Server) Listen(address string) error {
	return s.echoInstance.Start(address)
}
