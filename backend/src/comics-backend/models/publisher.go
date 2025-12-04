package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type PublisherRow struct {
	ID         int64  `db:"id"`
	Name       string `db:"name"`
	CreatedAt  string `db:"created_at"`
	ModifiedAt string `db:"modified_at"`
}

type Publisher struct {
	ID         int64      `json:"id"`
	Name       string     `json:"name"`
	Editions   []*Edition `json:"editions"`
	CreatedAt  string     `json:"createdAt"`
	ModifiedAt string     `json:"modifiedAt"`
}

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

func getPublisher(query string, params []any, skipEditions bool) (*Publisher, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	publisherRow := &PublisherRow{}
	if err := utils.SqlRowToStruct(row, publisherRow); err != nil {
		return nil, err
	}
	return instPublisherFromRow(publisherRow, skipEditions)
}

func getPublisherList(query string, params []any, skipEditions bool) ([]*Publisher, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	publisherRows := []*PublisherRow{}
	err = utils.SqlRowsToStructList(rows, &publisherRows)
	if err != nil {
		return nil, err
	}
	publishers := []*Publisher{}
	for _, publisherRow := range publisherRows {
		publisher, err := instPublisherFromRow(publisherRow, skipEditions)
		if err != nil {
			return nil, err
		}
		publishers = append(publishers, publisher)
	}
	return publishers, nil
}

func GetPublisherByID(publisherID int64, skipEditions bool) (*Publisher, error) {
	query := fmt.Sprintf("SELECT %s FROM publishers WHERE id=$1", utils.GetSelectQueryFields[PublisherRow](""))
	return getPublisher(query, []any{publisherID}, skipEditions)
}
