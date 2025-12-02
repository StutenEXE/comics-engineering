package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type IssueRow struct {
	ID           int64
	Name         string
	Number       int
	ParutionDate string
	IssueSerieID int64
	CreatedAt    string
	ModifiedAt   string
	UserID       int64
}

/*
Simplified issue to avoid infinite loop calls

Example : Books can have multiple Issues and Issues can have multiple Books. So Books will instantiate Issues who will instatiate Books etc...
*/
type SimpleIssue struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Number       int    `json:"number"`
	ParutionDate string `json:"parutionDate"`
	CreatedAt    string `json:"createdAt"`
	ModifiedAt   string `json:"modifiedAt"`
	AddedBy      *User  `json:"addedBy"`
}

type Issue struct {
	ID           int64             `json:"id"`
	Name         string            `json:"name"`
	Number       int               `json:"number"`
	ParutionDate string            `json:"parutionDate"`
	IssueSerie   *SimpleIssueSerie `json:"issueSerie"`
	Books        []*SimpleBook     `json:"books"`
	CreatedAt    string            `json:"createdAt"`
	ModifiedAt   string            `json:"modifiedAt"`
	AddedBy      *User             `json:"addedBy"`
}

/*
The order of the requested elements is the following:
id, name, number, parution_date, series_id, created_at, modified_at, added_by
*/
func getQueryFieldsForIssue(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %snumber, %sparution_date, %sseries_id, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

/*
Helper function to extract BookRow slices from sql.Rows
Rows must contain the fields in the order defined in getQueryFieldsForBook
*/
func getIssueRowsFromRows(rows *sql.Rows) ([]*IssueRow, error) {
	var issueRows []*IssueRow
	for rows.Next() {
		issueRow := &IssueRow{}
		if err := rows.Scan(&issueRow.ID, &issueRow.Name, &issueRow.Number, &issueRow.ParutionDate,
			&issueRow.IssueSerieID, &issueRow.CreatedAt, &issueRow.ModifiedAt, &issueRow.UserID); err != nil {
			return nil, err
		}
		issueRows = append(issueRows, issueRow)
	}
	return issueRows, nil
}

func instSimpleIssueFromRow(row *IssueRow) (*SimpleIssue, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	book := &SimpleIssue{
		ID:           row.ID,
		Name:         row.Name,
		Number:       row.Number,
		ParutionDate: row.ParutionDate,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return book, nil
}

func instIssueFromRow(row *IssueRow) (*Issue, error) {
	serie, err := GetSimpleIssueSerieByID(row.IssueSerieID)
	if err != nil {
		return nil, err
	}
	books, err := GetSimpleBooksByIssueID(row.ID)
	if err != nil {
		return nil, err
	}
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
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

func GetSimpleIssuesByIssueSerieID(seriesID int64) ([]*SimpleIssue, error) {
	query := fmt.Sprintf("SELECT %s FROM issues WHERE series_id=$1", getQueryFieldsForIssue(""))
	rows, err := database.PgDb.Query(query, seriesID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	issues := []*SimpleIssue{}
	issueRows, err := getIssueRowsFromRows(rows)
	for _, issueRow := range issueRows {
		issue, err := instSimpleIssueFromRow(issueRow)
		if err != nil {
			return nil, err
		}
		issues = append(issues, issue)
	}
	return issues, nil
}

func GetSimpleIssuesByBookID(bookID int64) ([]*SimpleIssue, error) {
	query := fmt.Sprintf(`SELECT %s FROM issues i 
	INNER JOIN books_issues bi ON i.id=bi.issue_id 
	WHERE bi.book_id=$1
	ORDER BY i.number`, getQueryFieldsForIssue("i"))
	rows, err := database.PgDb.Query(query, bookID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	issues := []*SimpleIssue{}
	issueRows, err := getIssueRowsFromRows(rows)
	for _, issueRow := range issueRows {
		issue, err := instSimpleIssueFromRow(issueRow)
		if err != nil {
			return nil, err
		}
		issues = append(issues, issue)
	}
	return issues, nil
}
