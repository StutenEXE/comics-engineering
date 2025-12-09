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
		ID           int64 `form:"id"`
		WithSerie    bool  `form:"withSerie"`
		WithEditions bool  `form:"withEditions"`
		WithIssues   bool  `form:"withIssues"`
		WithUser     bool  `form:"withUser"`
	}
	// GET form data
	var req BookByIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	book, err := models.GetBookByID(req.ID, req.WithSerie, req.WithEditions, req.WithIssues, req.WithUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("book not found (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	// book.Serie.Books, err = models.GetBooksBySerieID(book.Serie.ID, false, false, false)
	// if err != nil && err == sql.ErrNoRows {
	// 	errmsg := fmt.Sprintf("book not found for serie (id=%d)", req.ID)
	// 	utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
	// 	return
	// } else if err != nil {
	// 	utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
	// 	return
	// }
	c.JSON(http.StatusOK, gin.H{
		"book": book,
	})
}

func GetBooksBySerieID(c *gin.Context) {
	type BookBySerieIDRequest struct {
		ID           int64 `form:"id"`
		WithSerie    bool  `form:"withSerie"`
		WithEditions bool  `form:"withEditions"`
		WithIssues   bool  `form:"withIssues"`
		WithUser     bool  `form:"withUser"`
	}
	// GET form data
	var req BookBySerieIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	books, err := models.GetBooksBySerieID(req.ID, req.WithSerie, req.WithEditions, req.WithIssues, req.WithUser)
	if err != nil && err == sql.ErrNoRows {
		errmsg := fmt.Sprintf("books not found for serie (id=%d)", req.ID)
		utils.ReturnErrorMessage(c, http.StatusNotFound, errmsg, err)
		return
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"books": books,
	})
}

func GetLatestBooks(c *gin.Context) {
	type LatestBooksRequest struct {
		From         int  `form:"from"`
		Limit        int  `form:"limit"`
		WithSerie    bool `form:"withSerie"`
		WithEditions bool `form:"withEditions"`
		WithIssues   bool `form:"withIssues"`
		WithUser     bool `form:"withUser"`
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

	books, err := models.GetLatestBooks(req.From, req.Limit, req.WithSerie, req.WithEditions, req.WithIssues, req.WithUser)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "failed to get latest books", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"books": books,
	})
}
