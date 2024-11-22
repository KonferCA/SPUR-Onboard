package server

import (
	"context"
	"net/http"

	"github.com/KonferCA/NoKap/db"
	mw "github.com/KonferCA/NoKap/internal/middleware"
	"github.com/labstack/echo/v4"
)

func (s *Server) handleCreateEmployee(c echo.Context) error {
	var req *CreateEmployeeRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*CreateEmployeeRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	companyID, err := validateUUID(req.CompanyID, "company")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetCompanyByID(context.Background(), companyID)
	if err != nil {
		return handleDBError(err, "verify", "company")
	}

	_, err = queries.GetEmployeeByEmail(context.Background(), req.Email)
	if err == nil {
		return echo.NewHTTPError(http.StatusConflict, "Email already in use")
	}

	params := db.CreateEmployeeParams{
		CompanyID: companyID,
		Name:      req.Name,
		Email:     req.Email,
		Role:      req.Role,
		Bio:       req.Bio,
	}

	employee, err := queries.CreateEmployee(context.Background(), params)
	if err != nil {
		return handleDBError(err, "create", "employee")
	}

	return c.JSON(http.StatusCreated, employee)
}

func (s *Server) handleGetEmployee(c echo.Context) error {
	employeeID, err := validateUUID(c.Param("id"), "employee")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)
	employee, err := queries.GetEmployeeByID(context.Background(), employeeID)
	if err != nil {
		return handleDBError(err, "fetch", "employee")
	}

	return c.JSON(http.StatusOK, employee)
}

func (s *Server) handleListEmployees(c echo.Context) error {
	queries := db.New(s.DBPool)

	companyID := c.QueryParam("company_id")
	if companyID != "" {
		companyUUID, err := validateUUID(companyID, "company")
		if err != nil {
			return err
		}

		employees, err := queries.ListEmployeesByCompany(context.Background(), companyUUID)
		if err != nil {
			return handleDBError(err, "fetch", "employees")
		}
		return c.JSON(http.StatusOK, employees)
	}

	employees, err := queries.ListEmployees(context.Background())
	if err != nil {
		return handleDBError(err, "fetch", "employees")
	}

	return c.JSON(http.StatusOK, employees)
}

func (s *Server) handleUpdateEmployee(c echo.Context) error {
	employeeID, err := validateUUID(c.Param("id"), "employee")
	if err != nil {
		return err
	}

	var req *UpdateEmployeeRequest
	req, ok := c.Get(mw.REQUEST_BODY_KEY).(*UpdateEmployeeRequest)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetEmployeeByID(context.Background(), employeeID)
	if err != nil {
		return handleDBError(err, "verify", "employee")
	}

	params := db.UpdateEmployeeParams{
		ID:   employeeID,
		Name: req.Name,
		Role: req.Role,
		Bio:  req.Bio,
	}

	employee, err := queries.UpdateEmployee(context.Background(), params)
	if err != nil {
		return handleDBError(err, "update", "employee")
	}

	return c.JSON(http.StatusOK, employee)
}

func (s *Server) handleDeleteEmployee(c echo.Context) error {
	employeeID, err := validateUUID(c.Param("id"), "employee")
	if err != nil {
		return err
	}

	queries := db.New(s.DBPool)

	_, err = queries.GetEmployeeByID(context.Background(), employeeID)
	if err != nil {
		return handleDBError(err, "verify", "employee")
	}

	err = queries.DeleteEmployee(context.Background(), employeeID)
	if err != nil {
		return handleDBError(err, "delete", "employee")
	}

	return c.NoContent(http.StatusNoContent)
}
