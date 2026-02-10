package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type BookGetOptions struct {
	WithSerie    bool
	WithEditions bool
	WithIssues   bool
	WithUser     bool
}

// SQL representation
type bookDB struct {
	ID         int64  `db:"id" create_ignore:"true"`
	Name       string `db:"name"`
	Desc       string `db:"desc"`
	Number     int    `db:"number"`
	VoContent  string `db:"vo_content"` // TODO : remove
	SerieID    int64  `db:"series_id"`
	CreatedAt  string `db:"created_at" create_ignore:"true"`
	ModifiedAt string `db:"modified_at" create_ignore:"true"`
	UserID     int64  `db:"added_by"`
}

type BookModel struct {
	ID         int64           `json:"id"`
	Name       string          `json:"name"`
	Desc       string          `json:"desc"`
	Number     int             `json:"number"`
	VoContent  string          `json:"voContent"` // TODO : remove
	Serie      *Serie          `json:"serie"`
	Editions   []*EditionModel `json:"editions"`
	Issues     []*Issue        `json:"issues"`
	CreatedAt  string          `json:"createdAt"`
	ModifiedAt string          `json:"modifiedAt"`
	AddedBy    *User           `json:"addedBy"`
}

func (bkDb *bookDB) toModel(o BookGetOptions) (*BookModel, error) {
	var err error
	var serie *Serie = nil
	if o.WithSerie {
		// skipping books to avoid infinite loops and user
		serie, err = GetSerieByID(bkDb.SerieID, false, false)
		if err != nil {
			return nil, err
		}
	}
	editions := []*EditionModel{}
	if o.WithEditions {
		// skipping books to avoid infinite loops and user
		editions, err = GetEditionsByBookID(bkDb.ID, true, false, false)
		// A book can have no editions
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}
	}
	issues := []*Issue{}
	if o.WithIssues {
		// skipping books to avoid infinite loops and user
		issues, err = GetIssuesByBookID(bkDb.ID, true, false, false)
		// A book can have no issues
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}
	}
	var user *User = nil
	if o.WithUser {
		user, err = GetUserByID(bkDb.UserID)
		if err != nil {
			return nil, err
		}
	}
	book := &BookModel{
		ID:         bkDb.ID,
		Name:       bkDb.Name,
		Desc:       bkDb.Desc,
		Number:     bkDb.Number,
		VoContent:  bkDb.VoContent,
		Serie:      serie,
		Editions:   editions,
		Issues:     issues,
		CreatedAt:  bkDb.CreatedAt,
		ModifiedAt: bkDb.ModifiedAt,
		AddedBy:    user,
	}
	return book, nil
}

func (book *BookModel) toDb() (*bookDB, error) {
	if book == nil {
		return nil, fmt.Errorf("BookModel.toDb() nil book")
	}
	bkDb := &bookDB{
		ID:         book.ID,
		Name:       book.Name,
		Desc:       book.Desc,
		Number:     book.Number,
		VoContent:  book.VoContent,
		SerieID:    book.Serie.ID,
		CreatedAt:  book.CreatedAt,
		ModifiedAt: book.ModifiedAt,
		UserID:     book.AddedBy.ID,
	}
	return bkDb, nil
}

func getBookModel(query string, params []any, o BookGetOptions) (*BookModel, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	bkDb := &bookDB{}
	if err := utils.SqlRowToStruct(row, bkDb); err != nil {
		return nil, err
	}
	return bkDb.toModel(o)
}

func getBookList(query string, params []any, o BookGetOptions) ([]*BookModel, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bkDbs := []*bookDB{}
	err = utils.SqlRowsToStructList(rows, &bkDbs)
	if err != nil {
		return nil, err
	}
	books := []*BookModel{}
	for _, bkDb := range bkDbs {
		book, err := bkDb.toModel(o)
		if err != nil {
			return nil, err
		}
		books = append(books, book)
	}
	return books, nil
}

func (book *BookModel) Refresh() error {
	bkDb, err := book.toDb()
	if err != nil {
		return err
	}
	book, err = bkDb.toModel(BookGetOptions{true, true, true, true})
	if err != nil {
		return err
	}
	return nil
}

func ApproveBookSubmission(us *UserSubmission) (*BookModel, error) {
	// Parse submission data
	bkDb, err := utils.ParseSubmissionDataToStruct[bookDB](us.SubmissionData)
	if err != nil {
		return nil, err
	}
	// We do not want to retreive the user
	book, err := bkDb.toModel(BookGetOptions{
		WithSerie:    true,
		WithEditions: true,
		WithIssues:   true,
		WithUser:     false,
	})
	// Set added by user
	book.AddedBy = us.AddedBy
	switch us.SubmissionAction {
	// Create book in database
	case SubmissionActionEnum_CREATE:
		err = book.CreateBookInDatabase()
	// Update book in database
	case SubmissionActionEnum_UPDATE:
		err = book.UpdateBookInDatabase()
	// Delete book in database
	case SubmissionActionEnum_DELETE:
		// TODO
	}
	if err != nil {
		return nil, err
	}
	// Find all related submissions with associated user and related submission
	relatedSubmissions, err := GetUserSubmissionsByRelatedToID(us.ID, true, true)
	if err != nil {
		return nil, err
	}
	// For each related submission, update data with the approved book
	for _, rSubmission := range relatedSubmissions {
		switch rSubmission.SubmissionType {
		case SubmissionTypeEnum_EDITION:
			// If is an edition submission, parse data and set book
			editionRow, err := utils.ParseSubmissionDataToStruct[editionDB](rSubmission.SubmissionData)
			if err != nil {
				return nil, err
			}
			editionRow.BookID = book.ID
			editionData, err := json.Marshal(editionRow)
			if err != nil {
				return nil, err
			}
			rSubmission.SubmissionData = string(editionData)
			rSubmission.UpdateUserSubmission()
		case SubmissionTypeEnum_ISSUE:
			// If is an issue submission, parse data and set book
			// This is a special case, we want to create issues on book approval
			rSubmission.Approve()
		default:
			return nil, fmt.Errorf("ApproveBookSubmission() unsupported related submission type for book: %s", rSubmission.SubmissionType)
		}
	}
	return book, nil
}

func (book *BookModel) CreateBookInDatabase() error {
	bkDb, err := book.toDb()
	if err != nil {
		return err
	}
	query := fmt.Sprintf("INSERT INTO books (%s) VALUES (%s) RETURNING id, created_at, modified_at",
		utils.GetCreateQueryFields[bookDB](), utils.GetCreateQueryPlaceholders[bookDB]())
	err = database.PgDb.QueryRow(query, utils.GetCreateQueryValues(bkDb)...).Scan(&book.ID, &book.CreatedAt, &book.ModifiedAt)
	if err != nil {
		return err
	}
	// If issues are in the book, we want to link the book to them
	fmt.Println(book.Issues)
	for _, is := range book.Issues {
		err = linkIssueToBook(is, book)
		if err != nil {
			return err
		}
	}
	return nil
}

func (book *BookModel) UpdateBookInDatabase() error {
	bkDb, err := book.toDb()
	if err != nil {
		return err
	}
	placeholders, nplaceholders := utils.GetUpdateQueryPlaceholders(bkDb)
	query := fmt.Sprintf(`UPDATE user_submissions SET %s WHERE id=$%d`, placeholders, nplaceholders+1)
	params := utils.GetUpdateQueryValues(bkDb)
	params = append(params, bkDb.ID)
	_, err = database.PgDb.Exec(query, params...)
	if err != nil {
		return err
	}
	return nil
}

func GetBookByID(bookID int64, o BookGetOptions) (*BookModel, error) {
	query := fmt.Sprintf("SELECT %s FROM books WHERE id=$1", utils.GetSelectQueryFields[bookDB](""))
	return getBookModel(query, []any{bookID}, o)
}

func GetBooksBySerieID(seriesID int64, o BookGetOptions) ([]*BookModel, error) {
	query := fmt.Sprintf("SELECT %s FROM books WHERE series_id=$1", utils.GetSelectQueryFields[bookDB](""))
	return getBookList(query, []any{seriesID}, o)
}

func GetBooksByIssueID(issueID int64, o BookGetOptions) ([]*BookModel, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b 
		INNER JOIN books_issues bi ON b.id=bi.book_id 
		WHERE bi.issue_id=$1`, utils.GetSelectQueryFields[bookDB]("b"))
	return getBookList(query, []any{issueID}, o)
}

func GetLatestBooks(from int, limit int, o BookGetOptions) ([]*BookModel, error) {
	query := fmt.Sprintf("SELECT %s FROM books ORDER BY created_at DESC OFFSET $1 LIMIT $2",
		utils.GetSelectQueryFields[bookDB](""))
	return getBookList(query, []any{from, limit}, o)
}

func GetBooksFromWishlist(userID int64, o BookGetOptions) ([]*BookModel, error) {
	query := fmt.Sprintf(`SELECT %s FROM books b
			  INNER JOIN wishlist w ON b.id = w.book_id
			  WHERE w.user_id = $1`, utils.GetSelectQueryFields[bookDB]("b"))
	return getBookList(query, []any{userID}, o)
}

func SearchBooksByName(str string) ([]*BookModel, error) {
	query := fmt.Sprintf(`SELECT %s FROM books WHERE LOWER(name) LIKE $1`,
		utils.GetSelectQueryFields[bookDB](""))
	// Add %% around string for query
	str = fmt.Sprintf("%%%s%%", strings.ToLower(str))
	return getBookList(query, []any{str}, BookGetOptions{
		WithSerie:    true,
		WithEditions: true,
		WithIssues:   false,
		WithUser:     false,
	})
}
