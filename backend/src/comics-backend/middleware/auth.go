package middleware

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func SessionAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Read session cookie
		cookie, err := c.Cookie("session_id")
		if err != nil || cookie == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing session"})
			return
		}
		sessionKey := SessionPrefix + cookie
		// Fetch session from Redis
		sessionJSON, err := redisClient.Get(c, sessionKey).Result()
		if err == redis.Nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid session"})
			return
		} else if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "redis error"})
			return
		}
		// Deserialize session
		var session Session
		if err := json.Unmarshal([]byte(sessionJSON), &session); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "bad session data"})
			return
		}
		// Check session expiration
		if time.Now().After(session.ExpiresAt) {
			redisClient.Del(c, sessionKey)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "session expired"})
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
