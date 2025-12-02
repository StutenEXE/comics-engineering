package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
)

type IssueSerieRow struct {
	ID         int64
	Name       string
	Desc       string
	VoStart    string
	VoEnd      string
	CreatedAt  string
	ModifiedAt string
	UserID     int64
}

/*
Simplified issue serie to avoid infinite loop calls

Example : Issue has an IssueSerie and IssueSerie has Issues so Issue will instantiate IssueSerie who will instatiate Issues etc...
*/
type SimpleIssueSerie struct {
	ID         int64  `json:"id"`
	Name       string `json:"name"`
	Desc       string `json:"desc"`
	VoStart    string `json:"voStart"`
	VoEnd      string `json:"voEnd"`
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
	AddedBy    *User  `json:"addedBy"`
}

type IssueSerie struct {
	ID         int64          `json:"id"`
	Name       string         `json:"name"`
	Desc       string         `json:"desc"`
	VoStart    string         `json:"voStart"`
	VoEnd      string         `json:"voEnd"`
	Issues     []*SimpleIssue `json:"issues"`
	CreatedAt  string         `json:"createdAt"`
	ModifiedAt string         `json:"modifiedAt"`
	AddedBy    *User          `json:"addedBy"`
}

/*
The order of the requested elements is the following:
id, name, desc, vo_start, vo_end, created_at, modified_at, added_by
*/
func getQueryFieldsForIssueSerie(prefix string) string {
	if prefix != "" {
		prefix = prefix + "."
	}
	return fmt.Sprintf("%sid, %sname, %s\"desc\", %svo_start, %svo_end, %screated_at, %smodified_at, %sadded_by",
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix)
}

func getIssueSerieRowFromRow(row *sql.Row) (*IssueSerieRow, error) {
	serieRow := &IssueSerieRow{}
	err := row.Scan(&serieRow.ID, &serieRow.Name, serieRow.Desc, &serieRow.VoStart, &serieRow.VoEnd,
		&serieRow.CreatedAt, &serieRow.ModifiedAt, &serieRow.UserID)
	if err != nil {
		return nil, err
	}
	return serieRow, nil
}

func instSimpleIssueSerieFromRow(row *IssueSerieRow) (*SimpleIssueSerie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	serie := &SimpleIssueSerie{
		ID:         row.ID,
		Name:       row.Name,
		Desc:       row.Desc,
		VoStart:    row.VoStart,
		VoEnd:      row.VoEnd,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func instIssueSerieFromRow(row *IssueSerieRow) (*IssueSerie, error) {
	user, err := GetUserByID(row.UserID)
	if err != nil {
		return nil, err
	}
	issues, err := GetSimpleIssuesByIssueSerieID(row.ID)
	serie := &IssueSerie{
		ID:         row.ID,
		Name:       row.Name,
		Desc:       row.Desc,
		VoStart:    row.VoStart,
		VoEnd:      row.VoEnd,
		Issues:     issues,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func GetSimpleIssueSerieByID(serieID int64) (*SimpleIssueSerie, error) {
	serieRow := &IssueSerieRow{}
	query := fmt.Sprintf("SELECT %s FROM issue_series WHERE id=$1", getQueryFieldsForIssueSerie(""))
	row := database.PgDb.QueryRow(query, serieID)
	if err := row.Err(); err != nil {
		return nil, err
	}
	serieRow, err := getIssueSerieRowFromRow(row)
	if err != nil {
		return nil, err
	}
	return instSimpleIssueSerieFromRow(serieRow)
}
