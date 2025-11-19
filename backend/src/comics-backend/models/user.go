package models

import "github.com/StutenEXE/comics-backend/database"

type User struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

func GetUserByEmail(email string) (*User, error) {
	user := &User{}
	query := "SELECT id, username, email, password FROM users WHERE email=$1"
	row := database.PgDb.QueryRow(query, email)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&user.ID, &user.Username, &user.Email, &user.Password)
	if user.Username == "" {
		return nil, nil // User not found
	}
	return user, nil
}

func (u *User) CreateUserInDatabase() error {
	query := "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id"
	err := database.PgDb.QueryRow(query, u.Username, u.Email, u.Password).Scan(&u.ID)
	if err != nil {
		return err
	}
	return nil
}
