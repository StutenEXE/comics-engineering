package services

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetIssueSerieByID(c *gin.Context) {
	type IssueSerieByIDRequest struct {
		ID         int64 `form:"id"`
		WithIssues bool  `form:"withIssues"`
		WithUser   bool  `form:"withUser"`
	}
	// GET form data
	var req IssueSerieByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	issueSerie, err := models.GetIssueSerieByID(req.ID, req.WithIssues, req.WithUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("issue serie not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"issueSerie": issueSerie,
	})
}
