package middleware

import (
	"encoding/json"
	"time"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const SessionPrefix = "comic-session:"

type Session struct {
	UserID    int64     `json:"user_id"`
	Roles     []string  `json:"roles"`
	ExpiresAt time.Time `json:"expires_at"`
}

func CreateSessionKey() string {
	sessionID := uuid.NewString()
	return SessionPrefix + sessionID
}

func CreateSession(c *gin.Context, user *models.UserWithPassword) {
	session := &Session{
		UserID:    user.ID,
		Roles:     []string{"user"},
		ExpiresAt: time.Now().Add(30 * time.Minute),
	}

	if user.IsAdmin {
		session.Roles = append(session.Roles, "admin")
	}

	jsonData, _ := json.Marshal(session)
	sessionID := CreateSessionKey()
	redisClient.Set(c, sessionID, jsonData, 30*time.Minute)
	c.SetCookie(
		"session_id",
		sessionID,
		1800, // 30 min expiration
		"/",
		"",
		true, // Secure (HTTPS only)
		true, // HttpOnly (JS cannot read it)
	)
}
