package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type IssueRow struct {
	ID           int64  `db:"id"`
	Name         string `db:"name"`
	Number       int    `db:"number"`
	ParutionDate string `db:"parution_date"`
	IssueSerieID int64  `db:"series_id"`
	CreatedAt    string `db:"created_at"`
	ModifiedAt   string `db:"modified_at"`
	UserID       int64  `db:"added_by"`
}

type Issue struct {
	ID           int64       `json:"id"`
	Name         string      `json:"name"`
	Number       int         `json:"number"`
	ParutionDate string      `json:"parutionDate"`
	IssueSerie   *IssueSerie `json:"issueSerie"`
	Books        []*Book     `json:"books"`
	CreatedAt    string      `json:"createdAt"`
	ModifiedAt   string      `json:"modifiedAt"`
	AddedBy      *User       `json:"addedBy"`
}

func instIssueFromRow(row *IssueRow, skipIssueSerie, skipBooks bool) (*Issue, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	var serie *IssueSerie = nil
	if !skipIssueSerie {
		// Skipping issues to avoid infinite loops
		serie, err = GetIssueSerieByID(row.IssueSerieID, true)
		if err != nil {
			return nil, err
		}
	}
	books := []*Book{}
	if !skipBooks {
		// Skipping issues to avoid infinite loops
		books, err = GetBooksByIssueID(row.ID, false, false, true)
		if err != nil {
			return nil, err
		}
	}
	issue := &Issue{
		ID:           row.ID,
		Name:         row.Name,
		Number:       row.Number,
		ParutionDate: row.ParutionDate,
		IssueSerie:   serie,
		Books:        books,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return issue, nil
}

func getIssue(query string, params []any, skipIssueSerie, skipBooks bool) (*Issue, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	issueRow := &IssueRow{}
	if err := utils.SqlRowToStruct(row, issueRow); err != nil {
		return nil, err
	}
	return instIssueFromRow(issueRow, skipIssueSerie, skipBooks)
}

func getIssueList(query string, params []any, skipIssueSerie, skipBooks bool) ([]*Issue, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	issueRows := []*IssueRow{}
	err = utils.SqlRowsToStructList(rows, &issueRows)
	if err != nil {
		return nil, err
	}
	issues := []*Issue{}
	for _, issueRow := range issueRows {
		issue, err := instIssueFromRow(issueRow, skipIssueSerie, skipBooks)
		if err != nil {
			return nil, err
		}
		issues = append(issues, issue)
	}
	return issues, nil
}

func GetIssueByID(bookID int64, skipIssueSerie, skipBooks bool) (*Issue, error) {
	query := fmt.Sprintf("SELECT %s FROM issues WHERE id=$1", utils.GetSelectQueryFields[IssueRow](""))
	return getIssue(query, []any{bookID}, skipIssueSerie, skipBooks)
}

func GetIssuesByIssueSerieID(serieID int64, skipIssueSerie, skipBooks bool) ([]*Issue, error) {
	query := fmt.Sprintf("SELECT %s FROM issues WHERE series_id=$1", utils.GetSelectQueryFields[IssueRow](""))
	return getIssueList(query, []any{serieID}, skipIssueSerie, skipBooks)
}

func GetIssuesByBookID(bookID int64, skipIssueSerie, skipBooks bool) ([]*Issue, error) {
	query := fmt.Sprintf(`SELECT %s FROM issues i 
	INNER JOIN books_issues bi ON i.id=bi.issue_id 
	WHERE bi.book_id=$1
	ORDER BY i.number`, utils.GetSelectQueryFields[IssueRow]("i"))
	return getIssueList(query, []any{bookID}, skipIssueSerie, skipBooks)
}
