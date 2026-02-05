package services

import (
	"database/sql"
	"net/http"

	"github.com/StutenEXE/comics-backend/middleware"
	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func CreateUserService(c *gin.Context) {
	// Post form data
	var user *models.UserWithPassword
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	// If email already exists
	existingUser, err := models.GetUserByEmail(user.Email)
	if err != nil && err != sql.ErrNoRows {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	// Email already in use
	if existingUser != nil || err != sql.ErrNoRows {
		utils.ReturnErrorMessage(c, http.StatusConflict, "email already in use", nil)
		return
	}
	// Hash password
	hashedPwd, err := utils.HashPassword(user.Password)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	// Insert into database
	user = &models.UserWithPassword{
		Username: user.Username,
		Email:    user.Email,
		Password: hashedPwd,
	}
	err = user.CreateUserInDatabase()
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "database error", err)
		return
	}
	// Authenticate user
	middleware.CreateSession(c, user)
	// Hide password (even though it's not sent back)
	user.Password = ""
	// Respond with user data
	userResp, err := user.ConvertToUser()
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": userResp})
}

func LoginService(c *gin.Context) {
	// Post form data
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&loginData); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	// Database lookup
	user, err := models.GetUserByEmail(loginData.Email)
	if err != nil && err != sql.ErrNoRows {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	// No user found
	if err == sql.ErrNoRows {
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "invalid credentials", nil)
		return
	}
	// Check password
	if !utils.CheckPassword(user.Password, loginData.Password) {
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "invalid credentials", nil)
		return
	}
	// Authenticate user
	middleware.CreateSession(c, user)
	user.Password = "" // Hide password (should not be sent back anyway but just in case)
	userResp, err := user.ConvertToUser()
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": userResp})
}

func RefreshAuth(c *gin.Context) {
	var user *models.User = &models.User{}
	// Retreive session key
	sessionKey, err := c.Cookie("session_id")
	if err != nil || sessionKey == "" {
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "missing session", err)
		return
	}
	// Retreive session
	session, err := middleware.GetSessionFromRedis(c, sessionKey)
	if err != nil {
		// Already handled in redis function
		return
	}
	if session == nil {
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "session terminated", nil)
		return
	}
	// Get user in session
	user, err = models.GetUserByID(session.UserID)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func GetUserList(c *gin.Context) {
	type UserListRequest struct {
		From  int `form:"from"`
		Limit int `form:"limit"`
	}
	// GET form data
	var req UserListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	// Invalid params
	if req.From < 0 || req.Limit <= 0 {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", nil)
		return
	}

	users, err := models.GetUsers(req.From, req.Limit)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "failed to get users", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
	})
}
