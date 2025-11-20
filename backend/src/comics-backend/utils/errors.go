package utils

import (
	"log"

	"github.com/gin-gonic/gin"
)

func ReturnErrorMessage(c *gin.Context, code int, msg string, err error) {
	if code == 500 {
		// Log the error internally
		log.Printf("Internal error: %v", err)
	}
	c.AbortWithStatusJSON(code, gin.H{"error": msg})
}
