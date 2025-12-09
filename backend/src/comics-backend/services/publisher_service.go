package services

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetPublisherByID(c *gin.Context) {
	type PublisherByIDRequest struct {
		ID           int64 `form:"id"`
		withEditions bool  `form:"withEditions"`
	}
	// GET form data
	var req PublisherByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	publisher, err := models.GetPublisherByID(req.ID, req.withEditions)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("publisher not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"publisher": publisher,
	})
}
