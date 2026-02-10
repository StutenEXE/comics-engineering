package models

import (
	"database/sql"
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type IssueSerieGetQuery struct {
	WithIssues bool
	WithUser   bool
}

type IssueSerieDB struct {
	ID         int64          `db:"id"`
	Name       string         `db:"name"`
	Desc       sql.NullString `db:"desc"`
	VoStart    string         `db:"vo_start"`
	VoEnd      sql.NullString `db:"vo_end"`
	CreatedAt  string         `db:"created_at"`
	ModifiedAt string         `db:"modified_at"`
	UserID     int64          `db:"added_by"`
}

type IssueSerieModel struct {
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

func (iserieDb *IssueSerieDB) toModel(o IssueSerieGetQuery) (*IssueSerieModel, error) {
	var err error
	issues := []*Issue{}
	if o.WithIssues {
		// Skipping issue series to avoid infinite loops and user
		issues, err = GetIssuesByIssueSerieID(iserieDb.ID, false, true, false)
		if err != nil {
			return nil, err
		}
	}
	var user *User = nil
	if o.WithUser {
		user, err = GetUserByID(iserieDb.UserID)
		if err != nil {
			return nil, err
		}
	}
	// Handle nullable values
	var desc *string = nil
	if iserieDb.Desc.Valid {
		desc = &iserieDb.Desc.String
	}
	var voEnd *string = nil
	if iserieDb.VoEnd.Valid {
		voEnd = &iserieDb.VoEnd.String
	}
	serie := &IssueSerieModel{
		ID:         iserieDb.ID,
		Name:       iserieDb.Name,
		Desc:       desc,
		VoStart:    iserieDb.VoStart,
		VoEnd:      voEnd,
		Issues:     issues,
		CreatedAt:  iserieDb.CreatedAt,
		ModifiedAt: iserieDb.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func getIssueSerie(query string, params []any, o IssueSerieGetQuery) (*IssueSerieModel, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	iseriedb := &IssueSerieDB{}
	if err := utils.SqlRowToStruct(row, iseriedb); err != nil {
		return nil, err
	}
	return iseriedb.toModel(o)
}

func getIssueSerieList(query string, params []any, o IssueSerieGetQuery) ([]*IssueSerieModel, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	iserieDbs := []*IssueSerieDB{}
	err = utils.SqlRowsToStructList(rows, &iserieDbs)
	if err != nil {
		return nil, err
	}
	issueSeries := []*IssueSerieModel{}
	for _, iseriedb := range iserieDbs {
		issueSerie, err := iseriedb.toModel(o)
		if err != nil {
			return nil, err
		}
		issueSeries = append(issueSeries, issueSerie)
	}
	return issueSeries, nil
}

func GetIssueSerieByID(serieID int64, o IssueSerieGetQuery) (*IssueSerieModel, error) {
	query := fmt.Sprintf("SELECT %s FROM issue_series WHERE id=$1", utils.GetSelectQueryFields[IssueSerieDB](""))
	return getIssueSerie(query, []any{serieID}, o)
}
