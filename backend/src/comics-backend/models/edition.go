package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type EditionRow struct {
	ID           int64   `db:"id"`
	Isbn         string  `db:"isbn"`
	Ean          string  `db:"ean"`
	Price        float64 `db:"price"`
	URL          string  `db:"url"`
	ImgUrl       string  `db:"img_url"`
	CoverType    string  `db:"cover_type"`
	ParutionDate string  `db:"parution_date"`
	PublisherId  int64   `db:"publisher_id"`
	BookID       int64   `db:"book_id"`
	CreatedAt    string  `db:"created_at"`
	ModifiedAt   string  `db:"modified_at"`
	UserID       int64   `db:"added_by"`
}

type Edition struct {
	ID           int64      `json:"id"`
	Isbn         string     `json:"isbn"`
	Ean          string     `json:"ean"`
	Price        float64    `json:"price"`
	URL          string     `json:"url"`
	ImgUrl       string     `json:"imgUrl"`
	CoverType    string     `json:"coverType"`
	ParutionDate string     `json:"parutionDate"`
	Publisher    *Publisher `json:"publisher"`
	Book         *Book      `json:"book"`
	CreatedAt    string     `json:"createdAt"`
	ModifiedAt   string     `json:"modifiedAt"`
	AddedBy      *User      `json:"addedBy"`
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
		Price:        row.Price,
		URL:          row.URL,
		ImgUrl:       row.ImgUrl,
		CoverType:    row.CoverType,
		ParutionDate: row.ParutionDate,
		Publisher:    publisher,
		Book:         book,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return edition, nil
}

func getEdition(query string, params []any, skipPublisher, skipBook bool) (*Edition, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	editionRow := &EditionRow{}
	if err := utils.SqlRowToStruct(row, editionRow); err != nil {
		return nil, err
	}
	return instEditionFromRow(editionRow, skipPublisher, skipBook)
}

func getEditionList(query string, params []any, skipPublisher, skipBook bool) ([]*Edition, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	editionRows := []*EditionRow{}
	err = utils.SqlRowsToStructList(rows, &editionRows)
	if err != nil {
		return nil, err
	}
	editions := []*Edition{}
	for _, editionRow := range editionRows {
		edition, err := instEditionFromRow(editionRow, skipPublisher, skipBook)
		if err != nil {
			return nil, err
		}
		editions = append(editions, edition)
	}
	return editions, nil
}

func GetEditionByID(editionID int64, skipPublisher, skipBook bool) (*Edition, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE id=$1", utils.GetSelectQueryFields[EditionRow](""))
	return getEdition(query, []any{editionID}, skipPublisher, skipBook)
}

func GetEditionsByBookID(bookID int64, skipPublisher, skipBook bool) ([]*Edition, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE book_id=$1", utils.GetSelectQueryFields[EditionRow](""))
	return getEditionList(query, []any{bookID}, skipPublisher, skipBook)
}

func GetEditionsByPublisherID(publisherID int64, skipPublisher, skipBook bool) ([]*Edition, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE publisher_id=$1", utils.GetSelectQueryFields[EditionRow](""))
	return getEditionList(query, []any{publisherID}, skipPublisher, skipBook)
}
