package middleware

import (
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func authUser(c *gin.Context) {
	// Read session cookie
	sessionKey, err := c.Cookie("session_id")
	if err != nil || sessionKey == "" {
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "missing session", err)
		return
	}
	// Retreive session from redis
	session, err := GetSessionFromRedis(c, sessionKey)
	if err != nil {
		// Err already handled in redis function
		return
	}
	// Check session expiration
	if time.Now().After(session.ExpiresAt) {
		redisClient.Del(c, sessionKey)
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "session expired", nil)
		return
	}
	// Extend session expiration by 30 minutes
	redisClient.Expire(c, sessionKey, 30*time.Minute)
	// Store session in Gin context
	c.Set("session", session)
	c.Set("user_id", session.UserID)
}

func SessionAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Auth user if can be authed
		authUser(c)
		// Continue (exit middleware)
		c.Next()
	}
}

func AdminSessionAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Auth user if can be authed
		authUser(c)
		// Check if admin
		s, exists := c.Get("session")
		if !exists {
			return
		}
		session, ok := s.(*Session)
		if !ok {
			fmt.Printf("\n%v : %v test : %v\n\n", s, session, ok)
			utils.ReturnErrorMessage(c, http.StatusInternalServerError, "session badly formatted", nil)
			return
		}
		if !slices.Contains(session.Roles, "admin") {
			utils.ReturnErrorMessage(c, http.StatusUnauthorized, "only admins allowed", nil)
			return
		}
		// Continue (exit middleware)
		c.Next()
	}
}
