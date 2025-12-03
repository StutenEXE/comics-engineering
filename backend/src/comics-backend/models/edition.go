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

type Edition struct {
	ID           int64      `json:"id"`
	Isbn         string     `json:"isbn"`
	Ean          string     `json:"ean"`
	URL          string     `json:"url"`
	ImgUrl       string     `json:"imgUrl"`
	ParutionDate string     `json:"parutionDate"`
	Publisher    *Publisher `json:"publisher"`
	Book         *Book      `json:"book"`
	CreatedAt    string     `json:"createdAt"`
	ModifiedAt   string     `json:"modifiedAt"`
	AddedBy      *User      `json:"addedBy"`
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

func instEditionFromRow(row *EditionRow, skipPublisher, skipBook bool) (*Edition, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	var publisher *Publisher = nil
	if !skipPublisher {
		// Skipping editions to avoid infinite loops
		publisher, err = GetPublisherByID(row.PublisherId, true)
		if err != nil {
			return nil, err
		}
	}
	var book *Book = nil
	if !skipBook {
		// Skipping editions to avoid infinite loops
		book, err = GetBookByID(row.BookID, false, true, false)
		if err != nil {
			return nil, err
		}
	}
	edition := &Edition{
		ID:           row.ID,
		Isbn:         row.Isbn,
		Ean:          row.Ean,
		URL:          row.URL,
		ImgUrl:       row.ImgUrl,
		ParutionDate: row.ParutionDate,
		Publisher:    publisher,
		Book:         book,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return edition, nil
}

func GetEditionsByBookID(bookID int64, skipPublisher, skipBook bool) ([]*Edition, error) {
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
	var editions []*Edition
	for _, editionRow := range editionRows {
		edition, err := instEditionFromRow(editionRow, skipPublisher, skipBook)
		if err != nil {
			return nil, err
		}
		editions = append(editions, edition)
	}
	return editions, nil
}

func GetEditionsByPublisherID(bookID int64, skipPublisher, skipBook bool) ([]*Edition, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE publisher_id=$1", getQueryFieldsForEdition(""))
	rows, err := database.PgDb.Query(query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	editionRows, err := getEditionRowsFromRows(rows)
	if err != nil {
		return nil, err
	}
	var editions []*Edition
	for _, editionRow := range editionRows {
		edition, err := instEditionFromRow(editionRow, skipPublisher, skipBook)
		if err != nil {
			return nil, err
		}
		editions = append(editions, edition)
	}
	return editions, nil
}
