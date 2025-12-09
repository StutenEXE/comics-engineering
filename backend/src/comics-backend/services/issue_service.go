package services

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetIssueByID(c *gin.Context) {
	type IssueByIDRequest struct {
		ID             int64 `form:"id"`
		withIssueSerie bool  `form:"withIssueSerie"`
		withBooks      bool  `form:"withBooks"`
		withUser       bool  `form:"withUser"`
	}
	// GET form data
	var req IssueByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	issue, err := models.GetIssueByID(req.ID, req.withIssueSerie, req.withBooks, req.withUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("issue not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"issue": issue,
	})
}

func GetIssueByBookID(c *gin.Context) {
	type IssueByBookIDRequest struct {
		ID             int64 `form:"id"`
		withIssueSerie bool  `form:"withIssueSerie"`
		withBooks      bool  `form:"withBooks"`
		withUser       bool  `form:"withUser"`
	}
	// GET form data
	var req IssueByBookIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	issues, err := models.GetIssuesByBookID(req.ID, req.withIssueSerie, req.withBooks, req.withUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("issue not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"issues": issues,
	})
}
