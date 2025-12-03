package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type BookRow struct {
	ID         int64
	Name       string
	Desc       string
	Number     int
	VoContent  string
	SerieID    int64
	CreatedAt  string
	ModifiedAt string
	UserID     int64
}

type Book struct {
	ID         int64      `json:"id"`
	Name       string     `json:"name"`
	Desc       string     `json:"desc"`
	Number     int        `json:"number"`
	VoContent  string     `json:"voContent"`
	Serie      *Serie     `json:"serie"`
	Editions   []*Edition `json:"editions"`
	Issues     []*Issue   `json:"issues"`
	CreatedAt  string     `json:"createdAt"`
	ModifiedAt string     `json:"modifiedAt"`
	AddedBy    *User      `json:"addedBy"`
}

/*
The order of the requested elements is the following:
id, name, desc, number, vo_content, series_id, created_at, modified_at, added_by
*/
func getQueryFieldsForBook(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %s\"desc\", %snumber, %svo_content, %sseries_id, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

/*
Helper function to extract a BookRow from sql.Row
Row must contain the fields in the order defined in getQueryFieldsForBook
*/
func getBookRowFromRow(row *sql.Row) (*BookRow, error) {
	bookRow := &BookRow{}
	if err := row.Scan(&bookRow.ID, &bookRow.Name, &bookRow.Desc, &bookRow.Number, &bookRow.VoContent,
		&bookRow.SerieID, &bookRow.CreatedAt, &bookRow.ModifiedAt, &bookRow.UserID); err != nil {
		return nil, err
	}
	return bookRow, nil
}

/*
Helper function to extract BookRow slices from sql.Rows
Rows must contain the fields in the order defined in getQueryFieldsForBook
*/
func getBookRowsFromRows(rows *sql.Rows) ([]*BookRow, error) {
	var bookRows []*BookRow
	for rows.Next() {
		bookRow := &BookRow{}
		if err := rows.Scan(&bookRow.ID, &bookRow.Name, &bookRow.Desc, &bookRow.Number, &bookRow.VoContent,
			&bookRow.SerieID, &bookRow.CreatedAt, &bookRow.ModifiedAt, &bookRow.UserID); err != nil {
			return nil, err
		}
		bookRows = append(bookRows, bookRow)
	}
	return bookRows, nil
}

func instBookFromRow(row *BookRow, skipSerie, skipEditions, skipIssues bool) (*Book, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	var serie *Serie = nil
	if !skipSerie {
		// Skipping books to avoid infinite loops
		serie, err = GetSerieByID(row.SerieID, true)
		if err != nil {
			return nil, err
		}
	}
	editions := []*Edition{}
	if !skipEditions {
		// Skipping books to avoid infinite loops
		editions, err = GetEditionsByBookID(row.ID, false, true)
		if err != nil {
			return nil, err
		}
	}
	issues := []*Issue{}
	if !skipIssues {
		// Skipping books to avoid infinite loops
		issues, err = GetIssuesByBookID(row.ID, false, true)
		if err != nil {
			return nil, err
		}
	}
	book := &Book{
		ID:         row.ID,
		Name:       row.Name,
		Desc:       row.Desc,
		Number:     row.Number,
		VoContent:  row.VoContent,
		Serie:      serie,
		Editions:   editions,
		Issues:     issues,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return book, nil
}

func (b *Book) CreateBookInDatabase() error {
	query := "INSERT INTO books (name, desc, number, vo_content, series_id) VALUES ($1, $2, $3, $4, $5) RETURNING id"
	err := database.PgDb.QueryRow(query, b.Name, b.Desc, b.Number, b.VoContent, b.Serie.ID).Scan(&b.ID)
	if err != nil {
		return err
	}
	return nil
}

func (b *Book) UpdateBookInDatabase() error {
	query := "UPDATE books SET name=$1, desc=$2, number=$3, vo_content=$4, series_id=$5, modified_at=now() WHERE id=$6"
	_, err := database.PgDb.Exec(query, b.Name, b.Desc, b.Number, b.VoContent, b.Serie.ID, b.ID)
	if err != nil {
		return err
	}
	return nil
}

func GetBookByID(bookID int64, skipSerie, skipEditions, skipIssues bool) (*Book, error) {
	bookRow := &BookRow{}
	query := fmt.Sprintf("SELECT %s FROM books WHERE id=$1", getQueryFieldsForBook(""))
	row := database.PgDb.QueryRow(query, bookID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	bookRow, err := getBookRowFromRow(row)
	if err != nil {
		return nil, err
	}
	return instBookFromRow(bookRow, skipSerie, skipEditions, skipIssues)
}

func GetBooksBySeriesID(seriesID int64, skipSerie, skipEditions, skipIssues bool) ([]*Book, error) {
	query := fmt.Sprintf("SELECT %s FROM books WHERE series_id=$1", getQueryFieldsForBook(""))
	rows, err := database.PgDb.Query(query, seriesID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	books := []*Book{}
	bookRows, err := getBookRowsFromRows(rows)
	for _, bookRow := range bookRows {
		book, err := instBookFromRow(bookRow, skipSerie, skipEditions, skipIssues)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func GetBooksByIssueID(issueID int64, skipSerie, skipEditions, skipIssues bool) ([]*Book, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b 
		INNER JOIN books_issues bi ON b.id=bi.book_id 
		WHERE bi.issue_id=$1`, getQueryFieldsForBook("b"))
	rows, err := database.PgDb.Query(query, issueID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	books := []*Book{}
	bookRows, err := getBookRowsFromRows(rows)
	for _, bookRow := range bookRows {
		book, err := instBookFromRow(bookRow, skipSerie, skipEditions, skipIssues)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func GetLatestBooks(from int, limit int, skipSerie, skipEditions, skipIssues bool) ([]*Book, error) {
	query := fmt.Sprintf("SELECT %s FROM books ORDER BY created_at DESC OFFSET $1 LIMIT $2", getQueryFieldsForBook(""))
	rows, err := database.PgDb.Query(query, from, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	books := []*Book{}
	bookRows, err := getBookRowsFromRows(rows)
	if err != nil {
		return nil, err
	}
	for _, bookRow := range bookRows {
		book, err := instBookFromRow(bookRow, skipSerie, skipEditions, skipIssues)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func GetBooksFromWishlist(userID int64, skipSerie, skipEditions, skipIssues bool) ([]*Book, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b
			  INNER JOIN wishlist w ON b.id = w.book_id
			  WHERE w.user_id = $1`, getQueryFieldsForBook("b"))
	rows, err := database.PgDb.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var books []*Book
	bookRows, err := getBookRowsFromRows(rows)
	if err != nil {
		return nil, err
	}
	for _, bookRow := range bookRows {
		book, err := instBookFromRow(bookRow, skipSerie, skipEditions, skipIssues)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}
