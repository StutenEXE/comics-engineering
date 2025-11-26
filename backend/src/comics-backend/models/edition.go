package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type EditionRow struct {
	ID           int64
	Isbn         string
	Ean          string
	URL          string
	ImgUrl       string
	ParutionDate string
	PublisherId  int64
	BookID       int64
	CreatedAt    string
	ModifiedAt   string
	UserID       int64
}

/*
Simplified edition to avoid infinite loop calls

Example : Book has multiple Editions and an Edition has a Book. So Book will instantiate Editions who will instatiate Books etc...
*/
type SimpleEdition struct {
	ID           int64  `json:"id"`
	Isbn         string `json:"isbn"`
	Ean          string `json:"ean"`
	URL          string `json:"url"`
	ImgUrl       string `json:"imgUrl"`
	ParutionDate string `json:"parutionDate"`
	CreatedAt    string `json:"createdAt"`
	ModifiedAt   string `json:"modifiedAt"`
	AddedBy      *User  `json:"addedBy"`
}

type Edition struct {
	ID           int64            `json:"id"`
	Isbn         string           `json:"isbn"`
	Ean          string           `json:"ean"`
	URL          string           `json:"url"`
	ImgUrl       string           `json:"imgUrl"`
	ParutionDate string           `json:"parutionDate"`
	Publisher    *SimplePublisher `json:"publisher"`
	Book         *SimpleBook      `json:"book"`
	CreatedAt    string           `json:"createdAt"`
	ModifiedAt   string           `json:"modifiedAt"`
	AddedBy      *User            `json:"addedBy"`
}

/*
The order of the requested elements is the following:
id, isbn, ean, url, img_url, parution_date, publisher_id, book_id, created_at, modified_at, added_by
*/
func getQueryFieldsForEdition(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sisbn, %sean, %surl, %simg_url, %sparution_date, %spublisher_id, %sbook_id, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

/*
Helper function to extract a EditionRow from sql.Row
Row must contain the fields in the order defined in getQueryFieldsForEdition
*/
func getEditionRowFromRow(row *sql.Row) (*EditionRow, error) {
	editionRow := &EditionRow{}
	if err := row.Scan(&editionRow.ID, &editionRow.Isbn, &editionRow.Ean, &editionRow.URL, &editionRow.ImgUrl,
		&editionRow.ParutionDate, &editionRow.PublisherId, &editionRow.BookID, &editionRow.CreatedAt, &editionRow.ModifiedAt, &editionRow.UserID); err != nil {
		return nil, err
	}
	return editionRow, nil
}

/*
Helper function to extract EditionRow slices from sql.Rows
Rows must contain the fields in the order defined in getQueryFieldsForEdition
*/
func getEditionRowsFromRows(rows *sql.Rows) ([]*EditionRow, error) {
	var editionRows []*EditionRow
	for rows.Next() {
		editionRow := &EditionRow{}
		if err := rows.Scan(&editionRow.ID, &editionRow.Isbn, &editionRow.Ean, &editionRow.URL, &editionRow.ImgUrl,
			&editionRow.ParutionDate, &editionRow.PublisherId, &editionRow.BookID, &editionRow.CreatedAt, &editionRow.ModifiedAt, &editionRow.UserID); err != nil {
			return nil, err
		}
		editionRows = append(editionRows, editionRow)
	}
	return editionRows, nil
}

func instSimpleEditionFromRow(row *EditionRow) (*SimpleEdition, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	edition := &SimpleEdition{
		ID:           row.ID,
		Isbn:         row.Isbn,
		Ean:          row.Ean,
		URL:          row.URL,
		ImgUrl:       row.ImgUrl,
		ParutionDate: row.ParutionDate,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return edition, nil
}

func instEditionFromRow(row *EditionRow) (*Edition, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	simplePublisher, err := GetSimplePublisherByID(row.PublisherId)
	if err != nil {
		return nil, err
	}
	simpleBook, err := GetSimpleBookByID(row.BookID)
	if err != nil {
		return nil, err
	}
	edition := &Edition{
		ID:           row.ID,
		Isbn:         row.Isbn,
		Ean:          row.Ean,
		URL:          row.URL,
		ImgUrl:       row.ImgUrl,
		ParutionDate: row.ParutionDate,
		Publisher:    simplePublisher,
		Book:         simpleBook,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return edition, nil
}

func GetSimpleEditionsByBookID(bookID int64) ([]*SimpleEdition, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE book_id=$1", getQueryFieldsForEdition(""))
	rows, err := database.PgDb.Query(query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	editionRows, err := getEditionRowsFromRows(rows)
	if err != nil {
		return nil, err
	}
	var editions []*SimpleEdition
	for _, editionRow := range editionRows {
		edition, err := instSimpleEditionFromRow(editionRow)
		if err != nil {
			return nil, err
		}
		editions = append(editions, edition)
	}
	return editions, nil
}
