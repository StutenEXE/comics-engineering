package services

import (
	"database/sql"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func SearchBooksAndSeries(c *gin.Context) {
	type ComicsAndSeriesSearchParams struct {
		Query string `form:"query"`
	}

	// GET form data
	var req ComicsAndSeriesSearchParams
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}

	books := []*models.Book{}
	series := []*models.Serie{}
	// We limit the difficulty of research
	if len(req.Query) < 3 {
		c.JSON(http.StatusOK, gin.H{
			"books":  books,
			"series": series,
		})
		return
	}

	books, err := models.SearchBooksByName(req.Query)
	// If no rows found, do not throw error
	if err != nil && err != sql.ErrNoRows {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	series, err = models.SearchSeriesByName(req.Query)
	// If no rows found, do not throw error
	if err != nil && err != sql.ErrNoRows {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"books":  books,
		"series": series,
	})
}
