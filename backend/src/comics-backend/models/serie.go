package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type SerieRow struct {
	ID         int64
	Name       string
	Ongoing    bool
	Oneshot    bool
	Nvolumes   int
	VoStart    string
	VoEnd      string
	CreatedAt  string
	ModifiedAt string
	UserID     int64
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

/*
The order of the requested elements is the following:
id, name, ongoing, oneshot, nvolumes, vo_start, vo_end, created_at, modified_at, added_by
*/
func getQueryFieldsForSerie(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %songoing, %soneshot, %snvolumes, %svo_start, %svo_end, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

func getSerieRowFromRow(row *sql.Row) (*SerieRow, error) {
	serieRow := &SerieRow{}
	err := row.Scan(&serieRow.ID, &serieRow.Name, &serieRow.Ongoing, &serieRow.Oneshot, &serieRow.Nvolumes,
		&serieRow.VoStart, &serieRow.VoEnd, &serieRow.CreatedAt, &serieRow.ModifiedAt, &serieRow.UserID)
	if err != nil {
		return nil, err
	}
	return serieRow, nil
}

/*
Helper function to extract SerieRow from sql.Rows
Rows must contain the fields in the order defined in getQueryFieldsForSerie
*/
func getSerieRowsFromRows(rows *sql.Rows) ([]*SerieRow, error) {
	var serieRows []*SerieRow
	for rows.Next() {
		serieRow := &SerieRow{}
		err := rows.Scan(&serieRow.ID, &serieRow.Name, &serieRow.Ongoing, &serieRow.Oneshot, &serieRow.Nvolumes,
			&serieRow.VoStart, &serieRow.VoEnd, &serieRow.CreatedAt, &serieRow.ModifiedAt, &serieRow.UserID)
		if err != nil {
			return nil, err
		}
		serieRows = append(serieRows, serieRow)
	}
	return serieRows, nil
}

func instSerieFromRow(row *SerieRow, skipBooks bool) (*Serie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	books := []*Book{}
	if !skipBooks {
		books, err = GetBooksBySeriesID(row.ID, true, false, false)
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

func GetSerieByID(serieID int64, skipBooks bool) (*Serie, error) {
	serieRow := &SerieRow{}
	query := fmt.Sprintf("SELECT %s FROM series WHERE id=$1", getQueryFieldsForSerie(""))
	row := database.PgDb.QueryRow(query, serieID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	serieRow, err := getSerieRowFromRow(row)
	if err != nil {
		return nil, err
	}
	return instSerieFromRow(serieRow, skipBooks)
}
