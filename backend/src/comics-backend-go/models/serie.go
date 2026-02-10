package models

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type SerieRow struct {
	ID         int64   `db:"id" create_ignore:"true"`
	Name       string  `db:"name"`
	Ongoing    bool    `db:"ongoing"`
	Oneshot    bool    `db:"oneshot"`
	Nvolumes   int     `db:"nvolumes"`
	VoStart    string  `db:"vo_start"`
	VoEnd      *string `db:"vo_end"` // nullable
	CreatedAt  string  `db:"created_at" create_ignore:"true"`
	ModifiedAt string  `db:"modified_at" create_ignore:"true"`
	UserID     int64   `db:"added_by"`
}

type Serie struct {
	ID         int64        `json:"id"`
	Name       string       `json:"name"`
	Ongoing    bool         `json:"ongoing"`
	Oneshot    bool         `json:"oneshot"`
	Nvolumes   int          `json:"nvolumes"`
	VoStart    string       `json:"voStart"`
	VoEnd      *string      `json:"voEnd"`
	Books      []*BookModel `json:"books"`
	CreatedAt  string       `json:"createdAt"`
	ModifiedAt string       `json:"modifiedAt"`
	AddedBy    *User        `json:"addedBy"`
}

func instSerieFromRow(row *SerieRow, withBooks, withUser bool) (*Serie, error) {
	var err error
	books := []*BookModel{}
	if withBooks {
		// Skipping series to avoid infinite loop and user and issues for lag
		books, err = GetBooksBySerieID(row.ID, false, true, false, false)
		// Can have no books associated
		if err != nil && err != sql.ErrNoRows {
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
	serie := &Serie{
		ID:         row.ID,
		Name:       row.Name,
		Ongoing:    row.Ongoing,
		Oneshot:    row.Oneshot,
		Nvolumes:   row.Nvolumes,
		VoStart:    row.VoStart,
		VoEnd:      row.VoEnd,
		Books:      books,
		CreatedAt:  row.CreatedAt,
		ModifiedAt: row.ModifiedAt,
		AddedBy:    user,
	}
	return serie, nil
}

func instRowFromSerie(serie *Serie) (*SerieRow, error) {
	if serie == nil {
		return nil, fmt.Errorf("nil serie")
	}
	row := &SerieRow{
		ID:       serie.ID,
		Name:     serie.Name,
		Ongoing:  serie.Ongoing,
		Oneshot:  serie.Oneshot,
		Nvolumes: serie.Nvolumes,
		VoStart:  serie.VoStart,
		VoEnd:    serie.VoEnd,
		UserID:   serie.AddedBy.ID,
	}
	return row, nil
}

func getSerie(query string, params []any, withBooks, withUser bool) (*Serie, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	serieRow := &SerieRow{}
	if err := utils.SqlRowToStruct(row, serieRow); err != nil {
		return nil, err
	}
	return instSerieFromRow(serieRow, withBooks, withUser)
}

func getSerieList(query string, params []any, withBooks, withUser bool) ([]*Serie, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	serieRows := []*SerieRow{}
	err = utils.SqlRowsToStructList(rows, &serieRows)
	if err != nil {
		return nil, err
	}
	series := []*Serie{}
	for _, serieRow := range serieRows {
		serie, err := instSerieFromRow(serieRow, withBooks, withUser)
		if err != nil {
			return nil, err
		}
		series = append(series, serie)
	}
	return series, nil
}

// func ApproveSerieSubmission(us *UserSubmission) (*Serie, error) {
// 	// Parse submission data
// 	serieRow, err := utils.ParseSubmissionDataToStruct[SerieRow](us.SubmissionData)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// We do not get books or user from database for the serie approval (a book cannot exist without a serie)
// 	serie, err := instSerieFromRow(serieRow, false, false)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// Set added by user
// 	serie.AddedBy = us.AddedBy
// 	// Act according to the user's submission
// 	switch us.SubmissionAction {
// 	case SubmissionActionEnum_CREATE:
// 		err = serie.CreateSerieInDatabase()
// 	case SubmissionActionEnum_UPDATE:
// 		//err = serie.UpdateSerieInDatabase()
// 	case SubmissionActionEnum_DELETE:
// 		// TODO
// 	}
// 	if err != nil {
// 		return nil, err
// 	}
// 	// Find all related submissions
// 	relatedSubmissions, err := GetUserSubmissionsByRelatedToID(us.ID, true, true)
// 	if err != nil {
// 		return nil, err
// 	}
// 	// For each related submission, update data with the approved book
// 	for _, rSubmission := range relatedSubmissions {
// 		// Book submission is the only supported related type for serie
// 		if rSubmission.SubmissionType == SubmissionTypeEnum_BOOK {
// 			bookRow, err := utils.ParseSubmissionDataToStruct[bookDB](rSubmission.SubmissionData)
// 			if err != nil {
// 				return nil, err
// 			}
// 			bookRow.SerieID = serie.ID
// 			bookData, err := json.Marshal(bookRow)
// 			if err != nil {
// 				return nil, err
// 			}
// 			rSubmission.SubmissionData = string(bookData)
// 			rSubmission.UpdateUserSubmission()
// 		} else {
// 			return nil, fmt.Errorf("unsupported related submission type for serie: %s", rSubmission.SubmissionType)
// 		}
// 	}
// 	return serie, nil
// }

// PROOF OF CONCEPT ONLY, HAVE TO CREATE INTERMEDIATE TABLE FOR ADMIN VALIDATION
func (s *Serie) CreateSerieInDatabase() error {
	serieRow, err := instRowFromSerie(s)
	if err != nil {
		return err
	}
	query := fmt.Sprintf(`INSERT INTO series (%s) VALUES (%s) RETURNING id, created_at, modified_at`,
		utils.GetCreateQueryFields[SerieRow](), utils.GetCreateQueryPlaceholders[SerieRow]())
	err = database.PgDb.QueryRow(query, utils.GetCreateQueryValues(serieRow)...).Scan(&s.ID, &s.CreatedAt, &s.ModifiedAt)
	if err != nil {
		return err
	}
	return nil
}

func GetSerieByID(serieID int64, withBooks, withUser bool) (*Serie, error) {
	query := fmt.Sprintf("SELECT %s FROM series WHERE id=$1", utils.GetSelectQueryFields[SerieRow](""))
	return getSerie(query, []any{serieID}, withBooks, withUser)
}

func SearchSeriesByName(str string) ([]*Serie, error) {
	query := fmt.Sprintf(`SELECT %s FROM series WHERE LOWER(name) LIKE $1`,
		utils.GetSelectQueryFields[SerieRow](""))
	// Add %% around string for query
	str = fmt.Sprintf("%%%s%%", strings.ToLower(str))
	return getSerieList(query, []any{str}, true, false)
}
