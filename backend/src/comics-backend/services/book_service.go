package services

import (
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetLatestBooks(c *gin.Context) {
	type LatestBooksRequest struct {
		From  int `form:"from"`
		Limit int `form:"limit"`
	}
	// GET form data
	var req LatestBooksRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	// Invalid params
	if req.From < 0 || req.Limit <= 0 {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", nil)
		return
	}

	books, err := models.GetLatestBooks(req.From, req.Limit)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "failed to get latest books", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"books": books,
	})
}
