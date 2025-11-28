package models

import (
	"errors"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

// NEVER RETURN THIS OBJECT TO THE CLIENT
type UserWithPassword struct {
	ID         int64  `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
}

type User struct {
	ID         int64  `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
}

/*
The order of the requested elements is the following:
id, username, email, created_at, modified_at
*/
func getQueryFieldsForUser(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %susername, %semail, %screated_at, %smodified_at", prefix, prefix, prefix, prefix, prefix)
}

/*
The order of the requested elements is the following:
id, username, email, created_at, modified_at
*/
func getQueryFieldsForUserPassword(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %susername, %semail, %spassword, %screated_at, %smodified_at", prefix, prefix, prefix, prefix, prefix, prefix)
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
	query := fmt.Sprintf("SELECT %s FROM users WHERE id=$1", getQueryFieldsForUser(""))
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
	query := fmt.Sprintf("SELECT %s FROM users WHERE email=$1", getQueryFieldsForUserPassword(""))
	row := database.PgDb.QueryRow(query, email)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.CreatedAt, &user.ModifiedAt)
	// fmt.Printf("Retrieved user : %v", user)
	if user.Username == "" {
		return nil, nil // User not found
	}
	return user, nil
}
