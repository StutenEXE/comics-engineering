package services

import (
	"github.com/StutenEXE/comics-backend/middleware"
	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func CreateUserService(c *gin.Context) {
	// Post form data
	username := c.PostForm("username")
	email := c.PostForm("email")
	password := c.PostForm("password")
	// Hash password
	hashedPwd, err := utils.HashPassword(password)
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{"error": "internal error"})
		return
	}
	// Insert into database
	user := &models.User{
		Username: username,
		Email:    email,
		Password: hashedPwd,
	}
	err = user.CreateUserInDatabase()
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{"error": "database error"})
		return
	}
	// Authenticate user
	middleware.CreateSession(c, user)
	user.Password = "" // Hide password
	c.JSON(200, gin.H{"user": user})
}

func LoginService(c *gin.Context) {
	// Post form data
	email := c.PostForm("email")
	password := c.PostForm("password")
	// Database lookup
	user := models.GetUserByEmail(email)
	// No user found
	if user == nil {
		c.AbortWithStatusJSON(401, gin.H{"error": "invalid credentials"})
		return
	}
	// Check password
	if !utils.CheckPassword(user.Password, password) {
		c.AbortWithStatusJSON(401, gin.H{"error": "invalid credentials"})
		return
	}
	// Authenticate user
	middleware.CreateSession(c, user)
	user.Password = "" // Hide password
	c.JSON(200, gin.H{"user": user})
}
