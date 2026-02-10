package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type EditionGetOptions struct {
	WithPublisher bool
	WithBook      bool
	WithUser      bool
}

type editionDB struct {
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

type EditionModel struct {
	ID           int64      `json:"id"`
	Isbn         string     `json:"isbn"`
	Ean          string     `json:"ean"`
	Price        float64    `json:"price"`
	URL          string     `json:"url"`
	ImgUrl       string     `json:"imgUrl"`
	CoverType    string     `json:"coverType"`
	ParutionDate string     `json:"parutionDate"`
	Publisher    *Publisher `json:"publisher"`
	Book         *BookModel `json:"book"`
	CreatedAt    string     `json:"createdAt"`
	ModifiedAt   string     `json:"modifiedAt"`
	AddedBy      *User      `json:"addedBy"`
}

func (ed *editionDB) toModel(o EditionGetOptions) (*EditionModel, error) {
	var err error
	var publisher *Publisher = nil
	if o.WithPublisher {
		// Skipping editions to avoid infinite loops
		publisher, err = GetPublisherByID(ed.PublisherId, false)
		if err != nil {
			return nil, err
		}
	}
	var book *BookModel = nil
	if o.WithBook {
		// Skipping editions to avoid infinite loops and user
		book, err = GetBookByID(ed.BookID, BookGetOptions{
			WithSerie:    true,
			WithEditions: false,
			WithIssues:   true,
			WithUser:     true,
		})
		if err != nil {
			return nil, err
		}
	}
	var user *User = nil
	if o.WithUser {
		user, err = GetUserByID(ed.UserID)
		if err != nil {
			return nil, err
		}
	}
	em := &EditionModel{
		ID:           ed.ID,
		Isbn:         ed.Isbn,
		Ean:          ed.Ean,
		Price:        ed.Price,
		URL:          ed.URL,
		ImgUrl:       ed.ImgUrl,
		CoverType:    ed.CoverType,
		ParutionDate: ed.ParutionDate,
		Publisher:    publisher,
		Book:         book,
		CreatedAt:    ed.CreatedAt,
		ModifiedAt:   ed.ModifiedAt,
		AddedBy:      user,
	}
	return em, nil
}

func getEdition(query string, params []any, o EditionGetOptions) (*EditionModel, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	ed := &editionDB{}
	if err := utils.SqlRowToStruct(row, ed); err != nil {
		return nil, err
	}
	return ed.toModel(o)
}

func getEditionList(query string, params []any, o EditionGetOptions) ([]*EditionModel, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	edDbs := []*editionDB{}
	err = utils.SqlRowsToStructList(rows, &edDbs)
	if err != nil {
		return nil, err
	}
	editions := []*EditionModel{}
	for _, edDb := range edDbs {
		edition, err := edDb.toModel(o)
		if err != nil {
			return nil, err
		}
		editions = append(editions, edition)
	}
	return editions, nil
}

func GetEditionByID(editionID int64, o EditionGetOptions) (*EditionModel, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE id=$1", utils.GetSelectQueryFields[editionDB](""))
	return getEdition(query, []any{editionID}, o)
}

func GetEditionsByBookID(bookID int64, o EditionGetOptions) ([]*EditionModel, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE book_id=$1", utils.GetSelectQueryFields[editionDB](""))
	return getEditionList(query, []any{bookID}, o)
}

func GetEditionsByPublisherID(publisherID int64, o EditionGetOptions) ([]*EditionModel, error) {
	query := fmt.Sprintf("SELECT %s FROM editions WHERE publisher_id=$1", utils.GetSelectQueryFields[editionDB](""))
	return getEditionList(query, []any{publisherID}, o)
}
