package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type SerieRow struct {
	ID         int64
	Name       string
	Ongoing    bool
	Oneshot    bool
	Nvolumes   int
	CreatedAt  string
	ModifiedAt string
	UserID     int64
}

/*
Simplified serie to avoid infinite loop calls

Example : Book has a Serie and Serie has Books so Book will instantiate Serie who will instatiate Books etc...
*/
type SimpleSerie struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	Ongoing    bool   `json:"ongoing"`
	Oneshot    bool   `json:"oneshot"`
	Nvolumes   int    `json:"nvolumes"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
	AddedBy    *User  `json:"addedBy"`
}

type Serie struct {
	ID         int64         `json:"id"`
	Name       string        `json:"name"`
	Ongoing    bool          `json:"ongoing"`
	Oneshot    bool          `json:"oneshot"`
	Nvolumes   int           `json:"nvolumes"`
	Books      []*SimpleBook `json:"books"`
	CreatedAt  string        `json:"createdAt"`
	ModifiedAt string        `json:"modifiedAt"`
	AddedBy    *User         `json:"addedBy"`
}

func getQueryFieldsForSerie(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %songoing, %soneshot, %snvolumes, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

func instSimpleSerieFromRow(row *SerieRow) (*SimpleSerie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	serie := &SimpleSerie{
		ID:         row.ID,
		Name:       row.Name,
		Ongoing:    row.Ongoing,
		Oneshot:    row.Oneshot,
		Nvolumes:   row.Nvolumes,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func instSerieFromRow(row *SerieRow) (*Serie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	books, err := GetSimpleBooksBySeriesID(row.ID)
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

func GetSimpSerieByID(serieID int64) (*SimpleSerie, error) {
	serieRow := &SerieRow{}
	query := fmt.Sprintf("SELECT %s FROM series WHERE id=$1", getQueryFieldsForSerie(""))
	row := database.PgDb.QueryRow(query, serieID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&serieRow.ID, &serieRow.Name, &serieRow.Ongoing, &serieRow.Oneshot, &serieRow.Nvolumes, &serieRow.CreatedAt,
		&serieRow.ModifiedAt, &serieRow.UserID)
	if serieRow.Name == "" {
		return nil, nil // Serie not found
	}
	return instSimpleSerieFromRow(serieRow)
}
