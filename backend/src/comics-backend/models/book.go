package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type BookRow struct {
	ID         int64
	Name       string
	Desc       string
	Number     int
	SeriesID   int64
	CreatedAt  string
	ModifiedAt string
	UserID     int64
}

/*
Simplified book to avoid infinite loop calls

Example : Serie has multiple Book and Book has a Serie. So Serie will instantiate Books who will instatiate Series etc...
*/
type SimpleBook struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	Desc       string `json:"desc"`
	Number     int    `json:"number"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
	AddedBy    *User  `json:"addedBy"`
}

type Book struct {
	ID         int64        `json:"id"`
	Name       string       `json:"name"`
	Desc       string       `json:"desc"`
	Number     int          `json:"number"`
	Serie      *SimpleSerie `json:"serie"`
	CreatedAt  string       `json:"createdAt"`
	ModifiedAt string       `json:"modifiedAt"`
	AddedBy    *User        `json:"addedBy"`
}

/*
The order of the requested elements is the following:
id, name, desc, number, series_id, created_at, modified_at, added_by
*/
func getQueryFieldsForBook(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %s\"desc\", %snumber, %sseries_id, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

func instSimpleBookFromRow(row *BookRow) (*SimpleBook, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	book := &SimpleBook{
		ID:         row.ID,
		Name:       row.Name,
		Desc:       row.Desc,
		Number:     row.Number,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return book, nil
}

func instBookFromRow(row *BookRow) (*Book, error) {
	serie, err := GetSimpSerieByID(row.SeriesID)
	if err != nil {
		return nil, err
	}
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	book := &Book{
		ID:         row.ID,
		Name:       row.Name,
		Desc:       row.Desc,
		Number:     row.Number,
		Serie:      serie,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return book, nil
}

func (b *Book) CreateBookInDatabase() error {
	query := "INSERT INTO books (name, desc, number, series_id) VALUES ($1, $2, $3, $4) RETURNING id"
	err := database.PgDb.QueryRow(query, b.Name, b.Desc, b.Number, b.Serie.ID).Scan(&b.ID)
	if err != nil {
		return err
	}
	return nil
}

func (b *Book) UpdateBookInDatabase() error {
	query := "UPDATE books SET name=$1, desc=$2, number=$3, series_id=$4, modified_at=now() WHERE id=$5"
	_, err := database.PgDb.Exec(query, b.Name, b.Desc, b.Number, b.Serie.ID, b.ID)
	if err != nil {
		return err
	}
	return nil
}

func GetBookByID(bookID int64) (*Book, error) {
	bookRow := &BookRow{}
	query := fmt.Sprintf("SELECT %s FROM books WHERE id=$1", getQueryFieldsForBook(""))
	row := database.PgDb.QueryRow(query, bookID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	row.Scan(&bookRow.ID, &bookRow.Name, &bookRow.Desc, &bookRow.Number, &bookRow.SeriesID, &bookRow.CreatedAt,
		&bookRow.ModifiedAt)
	if bookRow.Name == "" {
		return nil, nil // Book not found
	}
	return instBookFromRow(bookRow)
}

func GetSimpleBooksBySeriesID(seriesID int64) ([]*SimpleBook, error) {
	query := fmt.Sprintf("SELECT %s FROM books WHERE series_id=$1", getQueryFieldsForBook(""))
	rows, err := database.PgDb.Query(query, seriesID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*SimpleBook
	for rows.Next() {
		bookRow := &BookRow{}
		if err := rows.Scan(&bookRow.ID, &bookRow.Name, &bookRow.Desc, &bookRow.Number, &bookRow.SeriesID, &bookRow.CreatedAt, &bookRow.ModifiedAt, &bookRow.UserID); err != nil {
			return nil, err
		}
		book, err := instSimpleBookFromRow(bookRow)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func GetLatestBooks(from int, limit int) ([]*Book, error) {
	query := fmt.Sprintf("SELECT %s FROM books ORDER BY created_at DESC OFFSET $1 LIMIT $2", getQueryFieldsForBook(""))
	rows, err := database.PgDb.Query(query, from, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	books := []*Book{}
	for rows.Next() {
		bookRow := &BookRow{}
		if err := rows.Scan(&bookRow.ID, &bookRow.Name, &bookRow.Desc, &bookRow.Number, &bookRow.SeriesID, &bookRow.CreatedAt, &bookRow.ModifiedAt, &bookRow.UserID); err != nil {
			return nil, err
		}
		book, err := instBookFromRow(bookRow)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func GetBooksFromWishlist(userID int64) ([]*Book, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b
			  INNER JOIN wishlist w ON b.id = w.book_id
			  WHERE w.user_id = $1`, getQueryFieldsForBook("b"))
	rows, err := database.PgDb.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*Book
	for rows.Next() {
		bookRow := &BookRow{}
		if err := rows.Scan(&bookRow.ID, &bookRow.Name, &bookRow.Desc, &bookRow.Number, &bookRow.SeriesID, &bookRow.CreatedAt, &bookRow.ModifiedAt, &bookRow.UserID); err != nil {
			return nil, err
		}
		book, err := instBookFromRow(bookRow)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}
