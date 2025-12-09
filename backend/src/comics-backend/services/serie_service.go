package services

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetSerieByID(c *gin.Context) {
	type SerieByIDRequest struct {
		ID        int64 `form:"id"`
		withBooks bool  `form:"withBooks"`
		withUser  bool  `form:"withUser"`
	}
	// GET form data
	var req SerieByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	serie, err := models.GetSerieByID(req.ID, req.withBooks, req.withUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("serie not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"serie": serie,
	})
}
