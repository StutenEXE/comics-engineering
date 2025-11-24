package models

import "github.com/StutenEXE/comics-backend/database"

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

type Serie struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	Ongoing    bool   `json:"ongoing"`
	Oneshot    bool   `json:"oneshot"`
	Nvolumes   int    `json:"nvolumes"`
	CreatedAt  string `json:"created_at"`
	ModifiedAt string `json:"modified_at"`
	AddedBy    *User  `json:"added_by"`
}

func instSeriesFromRow(row *SerieRow) (*Serie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	serie := &Serie{
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

func GetSerieByID(serieID int64) (*Serie, error) {
	serieRow := &SerieRow{}
	query := "SELECT id, name, ongoing, oneshot, nvolumes, created_at, updated_at, user_id FROM series WHERE id=$1"
	row := database.PgDb.QueryRow(query, serieID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&serieRow.ID, &serieRow.Name, &serieRow.Ongoing, &serieRow.Oneshot, &serieRow.Nvolumes, &serieRow.CreatedAt,
		&serieRow.ModifiedAt, &serieRow.UserID)
	if serieRow.Name == "" {
		return nil, nil // Serie not found
	}
	return instSeriesFromRow(serieRow)
}
