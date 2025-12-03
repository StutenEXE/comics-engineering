package utils

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ReturnErrorMessage(c *gin.Context, code int, msg string, err error) {
	if code == http.StatusInternalServerError || code == http.StatusNotFound {
		// Log the error internally
		log.Printf("Error %v: %v", code, err)
	}
	c.AbortWithStatusJSON(code, gin.H{"error": msg})
}
