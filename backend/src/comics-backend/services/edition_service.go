package services

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetEditionByID(c *gin.Context) {
	type EditionByIDRequest struct {
		ID            int64 `form:"id"`
		withPublisher bool  `form:"withPublisher"`
		withBook      bool  `form:"withBook"`
		withUser      bool  `form:"withUser"`
	}
	// GET form data
	var req EditionByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	edition, err := models.GetEditionByID(req.ID, req.withPublisher, req.withBook, req.withUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("edition not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"edition": edition,
	})
}
