package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type PublisherRow struct {
	ID         int64
	name       string
	createdAt  string
	modifiedAt string
}

/*
Simplified publisher to avoid infinite loop calls

Example : Publisher has multiple Editions and Edition has a Publisher. So Publisher will instantiate Editions who will instatiate Publishers etc...
*/
type SimplePublisher struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
}

type Publisher struct {
	ID         int64            `json:"id"`
	Name       string           `json:"name"`
	Editions   []*SimpleEdition `json:"editions"`
	CreatedAt  string           `json:"createdAt"`
	ModifiedAt string           `json:"modifiedAt"`
}

/*
The order of the requested elements is the following:
id, name, desc, number, vo_content, series_id, created_at, modified_at, added_by
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
	if err := row.Scan(&publisherRow.ID, &publisherRow.name, &publisherRow.createdAt, &publisherRow.modifiedAt); err != nil {
		return nil, err
	}
	return publisherRow, nil
}

/*
Helper function to extract EditionRow slices from sql.Rows
Rows must contain the fields in the order defined in getQueryFieldsForPublisher
*/
func getPublisherRowsFromRows(rows *sql.Rows) ([]*PublisherRow, error) {
	var publisherRows []*PublisherRow
	for rows.Next() {
		publisherRow := &PublisherRow{}
		if err := rows.Scan(&publisherRow.ID, &publisherRow.name, &publisherRow.createdAt, &publisherRow.modifiedAt); err != nil {
			return nil, err
		}
		publisherRows = append(publisherRows, publisherRow)
	}
	return publisherRows, nil
}

func GetSimplePublisherByID(publisherID int64) (*SimplePublisher, error) {

	query := fmt.Sprintf("SELECT %s FROM publishers WHERE id=$1", getQueryFieldsForPublisher(""))
	row := database.PgDb.QueryRow(query, publisherID)
	publisherRow, err := getPublisherRowFromRow(row)
	if err != nil {
		return nil, err
	}
	simplePublisher := &SimplePublisher{
		ID:         publisherRow.ID,
		Name:       publisherRow.name,
		CreatedAt:  publisherRow.createdAt,
		ModifiedAt: publisherRow.modifiedAt,
	}
	return simplePublisher, nil
}
