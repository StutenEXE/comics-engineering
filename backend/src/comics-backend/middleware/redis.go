package middleware

import (
	"encoding/json"
	"net/http"

	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client

func InitRedis(addr, password string, db int) {
	redisClient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
}

func GetSessionFromRedis(c *gin.Context, sessionKey string) (*Session, error) {
	// Fetch session from Redis
	sessionJSON, err := redisClient.Get(c, sessionKey).Result()
	if err == redis.Nil {
		utils.ReturnErrorMessage(c, http.StatusUnauthorized, "invalid session", err)
		return nil, err
	} else if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "redis error", err)
		return nil, err
	}
	// Deserialize session
	session := &Session{}
	if err := json.Unmarshal([]byte(sessionJSON), session); err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "bad session data", err)
		return nil, err
	}
	return session, nil
}
