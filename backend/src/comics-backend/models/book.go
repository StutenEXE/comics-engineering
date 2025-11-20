package models

import "github.com/StutenEXE/comics-backend/database"

type Book struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Desc     string `json:"desc"`
	Number   int    `json:"number"`
	SeriesID int64  `json:"series_id"`
}

func (b *Book) CreateBookInDatabase() error {
	query := "INSERT INTO books (name, desc, number, series_id) VALUES ($1, $2, $3, $4) RETURNING id"
	err := database.PgDb.QueryRow(query, b.Name, b.Desc, b.Number, b.SeriesID).Scan(&b.ID)
	if err != nil {
		return err
	}
	return nil
}

func GetBookByID(bookID int64) (*Book, error) {
	book := &Book{}
	query := "SELECT id, name, desc, number, series_id FROM books WHERE id=$1"
	row := database.PgDb.QueryRow(query, bookID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&book.ID, &book.Name, &book.Desc, &book.Number, &book.SeriesID)
	if book.Name == "" {
		return nil, nil // Book not found
	}
	return book, nil
}

func GetBooksBySeriesID(seriesID int64) ([]*Book, error) {
	query := "SELECT id, name, desc, number, series_id FROM books WHERE series_id=$1"
	rows, err := database.PgDb.Query(query, seriesID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*Book
	for rows.Next() {
		book := &Book{}
		if err := rows.Scan(&book.ID, &book.Name, &book.Desc, &book.Number, &book.SeriesID); err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}
