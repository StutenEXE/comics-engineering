package services

import (
	"github.com/StutenEXE/comics-backend/middleware"
	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func CreateUserService(c *gin.Context) {
	// Post form data
	var user *models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.AbortWithStatusJSON(400, gin.H{"error": "invalid request"})
		return
	}
	// If email already exists
	existingUser, err := models.GetUserByEmail(user.Email)
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{"error": "internal error"})
		return
	}
	// Email already in use
	if existingUser != nil {
		c.AbortWithStatusJSON(409, gin.H{"error": "email already in use"})
		return
	}
	// Hash password
	hashedPwd, err := utils.HashPassword(user.Password)
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{"error": "internal error"})
		return
	}
	// Insert into database
	user = &models.User{
		Username: user.Username,
		Email:    user.Email,
		Password: hashedPwd,
	}
	err = user.CreateUserInDatabase()
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{"error": "database error", "user": user})
		return
	}
	// Authenticate user
	middleware.CreateSession(c, user)
	// Hide password (even though it's not sent back)
	user.Password = ""
	c.JSON(200, gin.H{"user": user})
}

func LoginService(c *gin.Context) {
	// Post form data
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.AbortWithStatusJSON(400, gin.H{"error": "invalid request"})
		return
	}
	// Database lookup
	user, err := models.GetUserByEmail(loginData.Email)
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{"error": "internal error"})
		return
	}
	// No user found
	if user == nil {
		c.AbortWithStatusJSON(401, gin.H{"error": "invalid credentials"})
		return
	}
	// Check password
	if !utils.CheckPassword(user.Password, loginData.Password) {
		c.AbortWithStatusJSON(401, gin.H{"error": "invalid credentials"})
		return
	}
	// Authenticate user
	middleware.CreateSession(c, user)
	user.Password = "" // Hide password
	c.JSON(200, gin.H{"user": user})
}
