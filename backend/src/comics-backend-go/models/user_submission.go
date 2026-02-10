package models

import (
	"fmt"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/utils"
)

type SubmissionTypeEnum string

const (
	SubmissionTypeEnum_BOOK            SubmissionTypeEnum = "book"
	SubmissionTypeEnum_SERIE           SubmissionTypeEnum = "serie"
	SubmissionTypeEnum_EDITION         SubmissionTypeEnum = "edition"
	SubmissionTypeEnum_ISSUE           SubmissionTypeEnum = "issue"
	SubmissionTypeEnum_ISSUESERIE      SubmissionTypeEnum = "issueserie"
	SubmissionTypeEnum_PUBLISHER       SubmissionTypeEnum = "publisher"
	SubmissionTypeEnum_LINK_BOOK_ISSUE SubmissionTypeEnum = "link_book_issue"
)

type SubmissionActionEnum string

const (
	SubmissionActionEnum_CREATE SubmissionActionEnum = "create"
	SubmissionActionEnum_UPDATE SubmissionActionEnum = "update"
	SubmissionActionEnum_DELETE SubmissionActionEnum = "delete"
)

type UserSubmissionRow struct {
	ID               int64  `db:"id" create_ignore:"true" update_ignore:"true"`
	UserID           int64  `db:"user_id"`
	RelatedTo        *int64 `db:"related_to"` // nullable
	SubmissionType   string `db:"submission_type"`
	SubmissionAction string `db:"submission_action"`
	SubmissionData   string `db:"submission_data"`
	Note             string `db:"note"`
	Validated        bool   `db:"validated"`
	CreatedAt        string `db:"created_at" create_ignore:"true" update_ignore:"true"`
}

type UserSubmission struct {
	ID               int64                `json:"id"`
	AddedBy          *User                `json:"addedBy"`
	RelatedTo        *UserSubmission      `json:"relatedTo"`
	SubmissionType   SubmissionTypeEnum   `json:"submissionType"`
	SubmissionAction SubmissionActionEnum `json:"submissionAction"`
	SubmissionData   string               `json:"submissionData"`
	Note             string               `json:"note"`
	Validated        bool                 `json:"validated"`
	CreatedAt        string               `json:"createdAt"`
}

func instUserSubmissionFromRow(row *UserSubmissionRow, withUser, withRelated bool) (*UserSubmission, error) {
	var err error
	var user *User = nil
	if withUser {
		user, err = GetUserByID(row.UserID)
		if err != nil {
			return nil, err
		}
	}
	var relatedTo *UserSubmission = nil
	if withRelated && row.RelatedTo != nil {
		relatedTo, err = GetUserSubmissionByID(*row.RelatedTo, true, true)
		if err != nil {
			return nil, err
		}
	}
	submission := &UserSubmission{
		ID:               row.ID,
		AddedBy:          user,
		RelatedTo:        relatedTo,
		SubmissionType:   SubmissionTypeEnum(row.SubmissionType),
		SubmissionAction: SubmissionActionEnum(row.SubmissionAction),
		SubmissionData:   row.SubmissionData,
		Note:             row.Note,
		Validated:        row.Validated,
		CreatedAt:        row.CreatedAt,
	}
	return submission, nil
}

func instRowFromUserSubmission(us *UserSubmission) (*UserSubmissionRow, error) {
	if us == nil {
		return nil, fmt.Errorf("nil user submission")
	}
	var relatedId *int64 = nil
	if us.RelatedTo != nil {
		relatedId = &us.RelatedTo.ID
	}
	row := &UserSubmissionRow{
		ID:               us.ID,
		UserID:           us.AddedBy.ID,
		RelatedTo:        relatedId,
		SubmissionType:   string(us.SubmissionType),
		SubmissionAction: string(us.SubmissionAction),
		SubmissionData:   us.SubmissionData,
		Note:             us.Note,
		Validated:        us.Validated,
		CreatedAt:        us.CreatedAt,
	}
	return row, nil
}

func getUserSubmission(query string, params []any, withUser, withRelated bool) (*UserSubmission, error) {
	row := database.PgDb.QueryRow(query, params...)
	if err := row.Err(); err != nil {
		return nil, err
	}
	userSubmissionRow := &UserSubmissionRow{}
	if err := utils.SqlRowToStruct(row, userSubmissionRow); err != nil {
		return nil, err
	}
	return instUserSubmissionFromRow(userSubmissionRow, withUser, withRelated)
}

func getUserSubmissionList(query string, params []any, withUser, withRelated bool) ([]*UserSubmission, error) {
	rows, err := database.PgDb.Query(query, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	userSubmissionRows := []*UserSubmissionRow{}
	err = utils.SqlRowsToStructList(rows, &userSubmissionRows)
	if err != nil {
		return nil, err
	}
	userSubmissions := []*UserSubmission{}
	for _, userSubmissionRow := range userSubmissionRows {
		userSubmission, err := instUserSubmissionFromRow(userSubmissionRow, withUser, withRelated)
		if err != nil {
			return nil, err
		}
		userSubmissions = append(userSubmissions, userSubmission)
	}
	return userSubmissions, nil
}

func (us *UserSubmission) CreateUserSubmissionInDatabase() error {
	userSubmissionRow, err := instRowFromUserSubmission(us)
	if err != nil {
		return err
	}
	query := fmt.Sprintf(`INSERT INTO user_submissions (%s) VALUES (%s) RETURNING id, created_at`,
		utils.GetCreateQueryFields[UserSubmissionRow](), utils.GetCreateQueryPlaceholders[UserSubmissionRow]())
	err = database.PgDb.QueryRow(query, utils.GetCreateQueryValues(userSubmissionRow)...).Scan(&us.ID, &us.CreatedAt)
	if err != nil {
		return err
	}
	return nil
}

func (us *UserSubmission) UpdateUserSubmission() error {
	usRow, err := instRowFromUserSubmission(us)
	if err != nil {
		return err
	}
	placeholders, nplaceholders := utils.GetUpdateQueryPlaceholders(usRow)
	query := fmt.Sprintf(`UPDATE user_submissions SET %s WHERE id=$%d`, placeholders, nplaceholders+1)
	params := utils.GetUpdateQueryValues(usRow)
	params = append(params, usRow.ID)
	_, err = database.PgDb.Exec(query, params...)
	if err != nil {
		return err
	}
	return nil
}

func (us *UserSubmission) Approve() (any, error) {
	var approvedItem any
	var err error
	// switch us.SubmissionType {
	// case SubmissionTypeEnum_BOOK:
	// 	approvedItem, err = ApproveBookSubmission(us)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// case SubmissionTypeEnum_SERIE:
	// 	approvedItem, err = ApproveSerieSubmission(us)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// case SubmissionTypeEnum_EDITION:
	// 	return nil, nil
	// case SubmissionTypeEnum_ISSUE:
	// 	return nil, nil
	// case SubmissionTypeEnum_ISSUESERIE:
	// 	return nil, nil
	// case SubmissionTypeEnum_PUBLISHER:
	// 	return nil, nil
	// default:
	// 	return nil, fmt.Errorf("unknown submission type: %s", us.SubmissionType)
	// }
	// us.Validated = true
	// err = us.UpdateUserSubmission()
	// if err != nil {
	// 	return nil, err
	// }
	return approvedItem, err
}

func GetUserSubmissionByID(userSubmissionID int64, withUser, withRelated bool) (*UserSubmission, error) {
	query := fmt.Sprintf("SELECT %s FROM user_submissions WHERE id=$1", utils.GetSelectQueryFields[UserSubmissionRow](""))
	return getUserSubmission(query, []any{userSubmissionID}, withUser, withRelated)
}

func GetUserSubmissionsByRelatedToID(relatedToID int64, withUser, withRelated bool) ([]*UserSubmission, error) {
	query := fmt.Sprintf("SELECT %s FROM user_submissions WHERE related_to=$1", utils.GetSelectQueryFields[UserSubmissionRow](""))
	return getUserSubmissionList(query, []any{relatedToID}, withUser, withRelated)
}

func GetUserSubmissionsByUserID(userID int64, withUser, withRelated bool) ([]*UserSubmission, error) {
	query := fmt.Sprintf("SELECT %s FROM user_submissions WHERE user_id=$1 ORDER BY created_at DESC", utils.GetSelectQueryFields[UserSubmissionRow](""))
	return getUserSubmissionList(query, []any{userID}, withUser, withRelated)
}
