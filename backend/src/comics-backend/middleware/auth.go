package middleware

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func SessionAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Read session cookie
		cookie, err := c.Cookie("session_id")
		if err != nil || cookie == "" {
			utils.ReturnErrorMessage(c, http.StatusUnauthorized, "missing session", err)
			return
		}
		sessionKey := SessionPrefix + cookie
		// Fetch session from Redis
		sessionJSON, err := redisClient.Get(c, sessionKey).Result()
		if err == redis.Nil {
			utils.ReturnErrorMessage(c, http.StatusUnauthorized, "invalid session", err)
			return
		} else if err != nil {
			utils.ReturnErrorMessage(c, http.StatusInternalServerError, "redis error", err)
			return
		}
		// Deserialize session
		var session Session
		if err := json.Unmarshal([]byte(sessionJSON), &session); err != nil {
			utils.ReturnErrorMessage(c, http.StatusInternalServerError, "bad session data", err)
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
		// Continue (exit middleware)
		c.Next()
	}
}
