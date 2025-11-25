package models

import (
	"errors"

	"github.com/StutenEXE/comics-backend/database"
)

// NEVER RETURN THIS OBJECT TO THE CLIENT
type UserWithPassword struct {
	ID         int64  `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	CreatedAt  string `json:"created_at"`
	ModifiedAt string `json:"modified_at"`
}

type User struct {
	ID         int64  `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	CreatedAt  string `json:"created_at"`
	ModifiedAt string `json:"modified_at"`
}

func (u *UserWithPassword) CreateUserInDatabase() error {
	query := "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id"
	err := database.PgDb.QueryRow(query, u.Username, u.Email, u.Password).Scan(&u.ID)
	if err != nil {
		return err
	}
	return nil
}

func (u *UserWithPassword) ConvertToUser() (*User, error) {
	if u == nil {
		return nil, errors.New("nil user")
	}
	userResp := &User{
		ID:         u.ID,
		Username:   u.Username,
		Email:      u.Email,
		CreatedAt:  u.CreatedAt,
		ModifiedAt: u.ModifiedAt,
	}
	return userResp, nil
}

func GetUserByID(userID int64) (*User, error) {
	user := &User{}
	query := "SELECT id, username, email, created_at, modified_at FROM users WHERE id=$1"
	row := database.PgDb.QueryRow(query, userID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&user.ID, &user.Username, &user.Email, &user.CreatedAt, &user.ModifiedAt)
	if user.Username == "" {
		return nil, nil // User not found
	}
	return user, nil
}

func GetUserByEmail(email string) (*UserWithPassword, error) {
	user := &UserWithPassword{}
	query := "SELECT id, username, email, password, created_at, modified_at FROM users WHERE email=$1"
	row := database.PgDb.QueryRow(query, email)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.CreatedAt, &user.ModifiedAt)
	if user.Username == "" {
		return nil, nil // User not found
	}
	return user, nil
}
