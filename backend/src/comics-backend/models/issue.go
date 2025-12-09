package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type IssueRow struct {
	ID           int64          `db:"id"`
	Name         string         `db:"name"`
	Number       int            `db:"number"`
	CoverDate    string         `db:"cover_date"`
	ParutionDate string         `db:"parution_date"`
	IsAnnual     bool           `db:"is_annual"`
	HasBackup    bool           `db:"has_backup"`
	BackupName   sql.NullString `db:"backup_name"`
	IssueSerieID int64          `db:"series_id"`
	CreatedAt    string         `db:"created_at"`
	ModifiedAt   string         `db:"modified_at"`
	UserID       int64          `db:"added_by"`
}

type Issue struct {
	ID           int64       `json:"id"`
	Name         string      `json:"name"`
	Number       int         `json:"number"`
	CoverDate    string      `json:"coverDate"`
	ParutionDate string      `json:"parutionDate"`
	IsAnnual     bool        `json:"isAnnual"`
	HasBackup    bool        `json:"hasBackup"`
	BackupName   *string     `json:"backupName"`
	IssueSerie   *IssueSerie `json:"issueSerie"`
	Books        []*Book     `json:"books"`
	CreatedAt    string      `json:"createdAt"`
	ModifiedAt   string      `json:"modifiedAt"`
	AddedBy      *User       `json:"addedBy"`
}

func instIssueFromRow(row *IssueRow, withIssueSerie, withBooks, withUser bool) (*Issue, error) {
	var err error
	var serie *IssueSerie = nil
	if withIssueSerie {
		// Skipping issues to avoid infinite loops and user
		serie, err = GetIssueSerieByID(row.IssueSerieID, false, false)
		if err != nil {
			return nil, err
		}
	}
	books := []*Book{}
	if withBooks {
		// Skipping issues to avoid infinite loops and user
		books, err = GetBooksByIssueID(row.ID, true, true, false, false)
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
	// Handle nullable values
	var backupName *string = nil
	if row.BackupName.Valid {
		backupName = &row.BackupName.String
	}
	issue := &Issue{
		ID:           row.ID,
		Name:         row.Name,
		Number:       row.Number,
		CoverDate:    row.CoverDate,
		ParutionDate: row.ParutionDate,
		IsAnnual:     row.IsAnnual,
		HasBackup:    row.HasBackup,
		BackupName:   backupName,
		IssueSerie:   serie,
		Books:        books,
		CreatedAt:    row.CreatedAt,
		ModifiedAt:   row.ModifiedAt,
		AddedBy:      user,
	}
	return issue, nil
}

func getIssue(query string, params []any, withIssueSerie, withBooks, withUser bool) (*Issue, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	issueRow := &IssueRow{}
	if err := utils.SqlRowToStruct(row, issueRow); err != nil {
		return nil, err
	}
	return instIssueFromRow(issueRow, withIssueSerie, withBooks, withUser)
}

func getIssueList(query string, params []any, withIssueSerie, withBooks, withUser bool) ([]*Issue, error) {
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
		issue, err := instIssueFromRow(issueRow, withIssueSerie, withBooks, withUser)
		if err != nil {
			return nil, err
		}
		issues = append(issues, issue)
	}
	return issues, nil
}

func GetIssueByID(bookID int64, withIssueSerie, withBooks, withUser bool) (*Issue, error) {
	query := fmt.Sprintf("SELECT %s FROM issues WHERE id=$1", utils.GetSelectQueryFields[IssueRow](""))
	return getIssue(query, []any{bookID}, withIssueSerie, withBooks, withUser)
}

func GetIssuesByIssueSerieID(serieID int64, withIssueSerie, withBooks, withUser bool) ([]*Issue, error) {
	query := fmt.Sprintf("SELECT %s FROM issues WHERE series_id=$1", utils.GetSelectQueryFields[IssueRow](""))
	return getIssueList(query, []any{serieID}, withIssueSerie, withBooks, withUser)
}

func GetIssuesByBookID(bookID int64, withIssueSerie, withBooks, withUser bool) ([]*Issue, error) {
	query := fmt.Sprintf(`SELECT %s FROM issues i 
	INNER JOIN books_issues bi ON i.id=bi.issue_id 
	WHERE bi.book_id=$1
	ORDER BY i.number`, utils.GetSelectQueryFields[IssueRow]("i"))
	return getIssueList(query, []any{bookID}, withIssueSerie, withBooks, withUser)
}
