package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type IssueSerieRow struct {
	ID         int64          `db:"id"`
	Name       string         `db:"name"`
	Desc       sql.NullString `db:"desc"`
	VoStart    string         `db:"vo_start"`
	VoEnd      sql.NullString `db:"vo_end"`
	CreatedAt  string         `db:"created_at"`
	ModifiedAt string         `db:"modified_at"`
	UserID     int64          `db:"added_by"`
}

type IssueSerie struct {
	ID         int64    `json:"id"`
	Name       string   `json:"name"`
	Desc       *string  `json:"desc"`
	VoStart    string   `json:"voStart"`
	VoEnd      *string  `json:"voEnd"`
	Issues     []*Issue `json:"issues"`
	CreatedAt  string   `json:"createdAt"`
	ModifiedAt string   `json:"modifiedAt"`
	AddedBy    *User    `json:"addedBy"`
}

func instIssueSerieFromRow(row *IssueSerieRow, skipIssues bool) (*IssueSerie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	issues := []*Issue{}
	if !skipIssues {
		// Skipping issue series to avoid infinite loops
		issues, err = GetIssuesByIssueSerieID(row.ID, true, false)
		if err != nil {
			return nil, err
		}
	}
	// Handle nullable values
	var desc *string = nil
	if row.Desc.Valid {
		desc = &row.Desc.String
	}
	var voEnd *string = nil
	if row.VoEnd.Valid {
		desc = &row.VoEnd.String
	}
	serie := &IssueSerie{
		ID:         row.ID,
		Name:       row.Name,
		Desc:       desc,
		VoStart:    row.VoStart,
		VoEnd:      voEnd,
		Issues:     issues,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func getIssueSerie(query string, params []any, skipIssues bool) (*IssueSerie, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	issueSerieRow := &IssueSerieRow{}
	if err := utils.SqlRowToStruct(row, issueSerieRow); err != nil {
		return nil, err
	}
	return instIssueSerieFromRow(issueSerieRow, skipIssues)
}

func getIssueSerieList(query string, params []any, skipIssues bool) ([]*IssueSerie, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	issueSerieRows := []*IssueSerieRow{}
	err = utils.SqlRowsToStructList(rows, &issueSerieRows)
	if err != nil {
		return nil, err
	}
	issueSeries := []*IssueSerie{}
	for _, issueSerieRow := range issueSerieRows {
		issueSerie, err := instIssueSerieFromRow(issueSerieRow, skipIssues)
		if err != nil {
			return nil, err
		}
		issueSeries = append(issueSeries, issueSerie)
	}
	return issueSeries, nil
}

func GetIssueSerieByID(serieID int64, skipIssues bool) (*IssueSerie, error) {
	query := fmt.Sprintf("SELECT %s FROM issue_series WHERE id=$1", utils.GetSelectQueryFields[IssueSerieRow](""))
	return getIssueSerie(query, []any{serieID}, skipIssues)
}
