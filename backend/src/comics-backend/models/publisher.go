package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type PublisherRow struct {
	ID         int64
	Name       string
	CreatedAt  string
	ModifiedAt string
}

type Publisher struct {
	ID         int64      `json:"id"`
	Name       string     `json:"name"`
	Editions   []*Edition `json:"editions"`
	CreatedAt  string     `json:"createdAt"`
	ModifiedAt string     `json:"modifiedAt"`
}

/*
The order of the requested elements is the following:
id, name, created_at, modified_at
*/
func getQueryFieldsForPublisher(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %screated_at, %smodified_at",
		prefix, prefix, prefix, prefix)
}

/*
Helper function to extract a EditionRow from sql.Row
Row must contain the fields in the order defined in getQueryFieldsForPublisher
*/
func getPublisherRowFromRow(row *sql.Row) (*PublisherRow, error) {
	publisherRow := &PublisherRow{}
	if err := row.Scan(&publisherRow.ID, &publisherRow.Name, &publisherRow.CreatedAt, &publisherRow.ModifiedAt); err != nil {
		return nil, err
	}
	return publisherRow, nil
}

/*
Helper function to extract EditionRow slices from sql.Rows
Rows must contain the fields in the order defined in getQueryFieldsForPublisher
// */
// func getPublisherRowsFromRows(rows *sql.Rows) ([]*PublisherRow, error) {
// 	var publisherRows []*PublisherRow
// 	for rows.Next() {
// 		publisherRow := &PublisherRow{}
// 		if err := rows.Scan(&publisherRow.ID, &publisherRow.name, &publisherRow.createdAt, &publisherRow.modifiedAt); err != nil {
// 			return nil, err
// 		}
// 		publisherRows = append(publisherRows, publisherRow)
// 	}
// 	return publisherRows, nil
// }

func instPublisherFromRow(row *PublisherRow, skipEditions bool) (*Publisher, error) {
	var err error
	editions := []*Edition{}
	if !skipEditions {
		// Skipping publisher to avoid infinite loops
		editions, err = GetEditionsByPublisherID(row.ID, true, false)
		if err != nil {
			return nil, err
		}
	}
	publisher := &Publisher{
		ID:         row.ID,
		Name:       row.Name,
		Editions:   editions,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
	}
	return publisher, nil
}

func GetPublisherByID(publisherID int64, skipEditions bool) (*Publisher, error) {
	query := fmt.Sprintf("SELECT %s FROM publishers WHERE id=$1", getQueryFieldsForPublisher(""))
	row := database.PgDb.QueryRow(query, publisherID)
	publisherRow, err := getPublisherRowFromRow(row)
	if err != nil {
		return nil, err
	}
	return instPublisherFromRow(publisherRow, skipEditions)
}
