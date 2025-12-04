package services

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func GetBookByID(c *gin.Context) {
	type BookByIDRequest struct {
		ID int64 `form:"id"`
	}
	// GET form data
	var req BookByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	book, err := models.GetBookByID(req.ID, false, false, false)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("book not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"book": book,
	})
}

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

	books, err := models.GetLatestBooks(req.From, req.Limit, false, false, true)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "failed to get latest books", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"books": books,
	})
}
