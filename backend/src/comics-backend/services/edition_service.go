package services

import (
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetEditionByID(c *gin.Context) {
	type EditionByIDRequest struct {
		ID int64 `form:"id"`
	}
	// GET form data
	var req EditionByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	edition, err := models.GetEditionByID(req.ID, false, false)
	if err != nil {
		errmsg := fmt.Sprintf("edition not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"edition": edition,
	})
}
