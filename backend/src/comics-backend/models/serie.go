package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type SerieRow struct {
	ID         int64  `db:"id"`
	Name       string `db:"name"`
	Ongoing    bool   `db:"ongoing"`
	Oneshot    bool   `db:"oneshot"`
	Nvolumes   int    `db:"nvolumes"`
	VoStart    string `db:"vo_start"`
	VoEnd      string `db:"vo_end"`
	CreatedAt  string `db:"created_at"`
	ModifiedAt string `db:"modified_at"`
	UserID     int64  `db:"added_by"`
}

type Serie struct {
	ID         int64   `json:"id"`
	Name       string  `json:"name"`
	Ongoing    bool    `json:"ongoing"`
	Oneshot    bool    `json:"oneshot"`
	Nvolumes   int     `json:"nvolumes"`
	VoStart    string  `json:"voStart"`
	VoEnd      string  `json:"voEnd"`
	Books      []*Book `json:"books"`
	CreatedAt  string  `json:"createdAt"`
	ModifiedAt string  `json:"modifiedAt"`
	AddedBy    *User   `json:"addedBy"`
}

func instSerieFromRow(row *SerieRow, withBooks, withUser bool) (*Serie, error) {
	var err error
	books := []*Book{}
	if withBooks {
		// Skipping series to avoid infinite loop and user and issues for lag
		books, err = GetBooksBySerieID(row.ID, false, true, false, false)
		if err != nil {
			return nil, err
		}
	}
	var user *User = nil
	if withUser {
		user, err = GetUserByID(row.UserID)
		if err != nil {
			return nil, err
		}
	}
	serie := &Serie{
		ID:         row.ID,
		Name:       row.Name,
		Ongoing:    row.Ongoing,
		Oneshot:    row.Oneshot,
		Nvolumes:   row.Nvolumes,
		Books:      books,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func getSerie(query string, params []any, withBooks, withUser bool) (*Serie, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	serieRow := &SerieRow{}
	if err := utils.SqlRowToStruct(row, serieRow); err != nil {
		return nil, err
	}
	return instSerieFromRow(serieRow, withBooks, withUser)
}

func getSerieList(query string, params []any, withBooks, withUser bool) ([]*Serie, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	serieRows := []*SerieRow{}
	err = utils.SqlRowsToStructList(rows, &serieRows)
	if err != nil {
		return nil, err
	}
	series := []*Serie{}
	for _, serieRow := range serieRows {
		serie, err := instSerieFromRow(serieRow, withBooks, withUser)
		if err != nil {
			return nil, err
		}
		series = append(series, serie)
	}
	return series, nil
}

func GetSerieByID(serieID int64, withBooks, withUser bool) (*Serie, error) {
	query := fmt.Sprintf("SELECT %s FROM series WHERE id=$1", utils.GetSelectQueryFields[SerieRow](""))
	return getSerie(query, []any{serieID}, withBooks, withUser)
}
