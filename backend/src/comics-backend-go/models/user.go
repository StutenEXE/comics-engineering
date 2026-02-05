package models

// TODO, refacto code here

import (
	"errors"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

// NEVER RETURN THIS OBJECT TO THE CLIENT
type UserWithPassword struct {
	ID         int64  `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	IsAdmin    bool   `json:"isAdmin"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
}

type UserRow struct {
	ID         int64  `db:"id"`
	Username   string `db:"username"`
	Email      string `db:"email"`
	Password   string `db:"password"`
	IsAdmin    bool   `db:"is_admin"`
	CreatedAt  string `db:"created_at"`
	ModifiedAt string `db:"modified_at"`
}

type User struct {
	ID         int64  `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	IsAdmin    bool   `json:"isAdmin"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
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
		IsAdmin:    u.IsAdmin,
		CreatedAt:  u.CreatedAt,
		ModifiedAt: u.ModifiedAt,
	}
	return userResp, nil
}

func instUserFromRow(row *UserRow) (*User, error) {
	user := &User{
		ID:         row.ID,
		Username:   row.Username,
		Email:      row.Email,
		IsAdmin:    row.IsAdmin,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
	}
	return user, nil
}

func instUserPwdFromRow(row *UserRow) (*UserWithPassword, error) {
	user := &UserWithPassword{
		ID:         row.ID,
		Username:   row.Username,
		Email:      row.Email,
		Password:   row.Password,
		IsAdmin:    row.IsAdmin,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
	}
	return user, nil
}

func getUser(query string, params []any) (*User, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	userRow := &UserRow{}
	if err := utils.SqlRowToStruct(row, userRow); err != nil {
		return nil, err
	}
	return instUserFromRow(userRow)
}

func getUserList(query string, params []any) ([]*User, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	userRow := []*UserRow{}
	err = utils.SqlRowsToStructList(rows, &userRow)
	if err != nil {
		return nil, err
	}
	users := []*User{}
	for _, userRow := range userRow {
		user, err := instUserFromRow(userRow)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func getUserPwd(query string, params []any) (*UserWithPassword, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	userRow := &UserRow{}
	if err := utils.SqlRowToStruct(row, userRow); err != nil {
		return nil, err
	}
	return instUserPwdFromRow(userRow)
}

func GetUserByID(userID int64) (*User, error) {
	query := fmt.Sprintf(`SELECT %s FROM users WHERE id=$1`,
		utils.GetSelectQueryFields[UserRow](""))
	return getUser(query, []any{userID})
}

func GetUserByEmail(email string) (*UserWithPassword, error) {
	query := fmt.Sprintf(`SELECT %s FROM users WHERE email LIKE $1`,
		utils.GetSelectQueryFields[UserRow](""))
	return getUserPwd(query, []any{email})
}

func GetUsers(from int, limit int) ([]*User, error) {
	query := fmt.Sprintf("SELECT %s FROM users ORDER BY modified_at DESC OFFSET $1 LIMIT $2",
		utils.GetSelectQueryFields[UserRow](""))
	return getUserList(query, []any{from, limit})

}
