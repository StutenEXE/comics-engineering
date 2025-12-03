package services

import (
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetIssueByID(c *gin.Context) {
	type IssueByIDRequest struct {
		ID int64 `form:"id"`
	}
	// GET form data
	var req IssueByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	issue, err := models.GetIssueByID(req.ID, false, false)
	if err != nil {
		errmsg := fmt.Sprintf("issue not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"issue": issue,
	})
}
