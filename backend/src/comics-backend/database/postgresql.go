package database

import (
	"database/sql"
	"fmt"
)

var PgDb *sql.DB

func buildDsnFromEnv(url, user, password, dbName string) string {
	return fmt.Sprintf("postgres://%s:%s@%s/%s?sslmode=disable", user, password, url, dbName)
}

func InitPostgreSQL(url, user, password, dbName string) error {
	dsn := buildDsnFromEnv(url, user, password, dbName)
	var err error
	PgDb, err = sql.Open("postgres", dsn)
	if err != nil {
		return err
	}
	return nil
}
