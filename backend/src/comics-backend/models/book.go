package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type BookRow struct {
	ID         int64  `db:"id"`
	Name       string `db:"name"`
	Desc       string `db:"desc"`
	Number     int    `db:"number"`
	VoContent  string `db:"vo_content"` // TODO : remove
	SerieID    int64  `db:"series_id"`
	CreatedAt  string `db:"created_at"`
	ModifiedAt string `db:"modified_at"`
	UserID     int64  `db:"added_by"`
}

type Book struct {
	ID         int64      `json:"id"`
	Name       string     `json:"name"`
	Desc       string     `json:"desc"`
	Number     int        `json:"number"`
	VoContent  string     `json:"voContent"` // TODO : remove
	Serie      *Serie     `json:"serie"`
	Editions   []*Edition `json:"editions"`
	Issues     []*Issue   `json:"issues"`
	CreatedAt  string     `json:"createdAt"`
	ModifiedAt string     `json:"modifiedAt"`
	AddedBy    *User      `json:"addedBy"`
}

func instBookFromRow(row *BookRow, withSerie, withEditions, withIssues, withUser bool) (*Book, error) {
	var err error
	var serie *Serie = nil
	if withSerie {
		// skipping books to avoid infinite loops and user
		serie, err = GetSerieByID(row.SerieID, false, false)
		if err != nil {
			return nil, err
		}
	}
	editions := []*Edition{}
	if withEditions {
		// skipping books to avoid infinite loops and user
		editions, err = GetEditionsByBookID(row.ID, true, false, false)
		if err != nil {
			return nil, err
		}
	}
	issues := []*Issue{}
	if withIssues {
		// skipping books to avoid infinite loops and user
		issues, err = GetIssuesByBookID(row.ID, true, false, false)
		if err != nil {
			return nil, err
		}
	}
	var user *User = nil
	if withUser {
		user, err = GetUserByID(row.UserID)
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

func getBook(query string, params []any, withSerie, withEditions, withIssues, withUser bool) (*Book, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	bookRow := &BookRow{}
	if err := utils.SqlRowToStruct(row, bookRow); err != nil {
		return nil, err
	}
	return instBookFromRow(bookRow, withSerie, withEditions, withIssues, withUser)
}

func getBookList(query string, params []any, withSerie, withEditions, withIssues, withUser bool) ([]*Book, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bookRows := []*BookRow{}
	err = utils.SqlRowsToStructList(rows, &bookRows)
	if err != nil {
		return nil, err
	}
	books := []*Book{}
	for _, bookRow := range bookRows {
		book, err := instBookFromRow(bookRow, withSerie, withEditions, withIssues, withUser)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
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

func GetBookByID(bookID int64, withSerie, withEditions, withIssues, withUser bool) (*Book, error) {
	query := fmt.Sprintf("SELECT %s FROM books WHERE id=$1", utils.GetSelectQueryFields[BookRow](""))
	return getBook(query, []any{bookID}, withSerie, withEditions, withIssues, withUser)
}

func GetBooksBySerieID(seriesID int64, withSerie, withEditions, withIssues, withUser bool) ([]*Book, error) {
	query := fmt.Sprintf("SELECT %s FROM books WHERE series_id=$1", utils.GetSelectQueryFields[BookRow](""))
	return getBookList(query, []any{seriesID}, withSerie, withEditions, withIssues, withUser)
}

func GetBooksByIssueID(issueID int64, withSerie, withEditions, withIssues, withUser bool) ([]*Book, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b 
		INNER JOIN books_issues bi ON b.id=bi.book_id 
		WHERE bi.issue_id=$1`, utils.GetSelectQueryFields[BookRow]("b"))
	return getBookList(query, []any{issueID}, withSerie, withEditions, withIssues, withUser)
}

func GetLatestBooks(from int, limit int, withSerie, withEditions, withIssues, withUser bool) ([]*Book, error) {
	query := fmt.Sprintf("SELECT %s FROM books ORDER BY created_at DESC OFFSET $1 LIMIT $2",
		utils.GetSelectQueryFields[BookRow](""))
	return getBookList(query, []any{from, limit}, withSerie, withEditions, withIssues, withUser)
}

func GetBooksFromWishlist(userID int64, withSerie, withEditions, withIssues, withUser bool) ([]*Book, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b
			  INNER JOIN wishlist w ON b.id = w.book_id
			  WHERE w.user_id = $1`, utils.GetSelectQueryFields[BookRow]("b"))
	return getBookList(query, []any{userID}, withSerie, withEditions, withIssues, withUser)
}
