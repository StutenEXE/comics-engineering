package services

import (
	"fmt"
	"net/http"

	"github.com/StutenEXE/comics-backend/models"
	"github.com/StutenEXE/comics-backend/utils"
	"github.com/gin-gonic/gin"
)

func CreateUserSubmission(c *gin.Context) {
	type UserSubmissionRequest struct {
		MainSubmission     models.UserSubmission   `json:"mainSubmission"`
		RelatedSubmissions []models.UserSubmission `json:"relatedSubmissions"`
	}
	// Post form data
	var req UserSubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	userId := c.MustGet("user_id")
	user, err := models.GetUserByID(userId.(int64))
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusNotFound, "user not found", err)
		return
	}
	// Create main submission in database
	req.MainSubmission.AddedBy = user
	err = req.MainSubmission.CreateUserSubmissionInDatabase()
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "error occurred while creating user submission", err)
		return
	}
	// Create related submissions in database
	for _, rSubmission := range req.RelatedSubmissions {
		rSubmission.AddedBy = user
		rSubmission.RelatedTo = &req.MainSubmission
		rSubmission.Note = fmt.Sprintf("Submission related to another submission (id=%d, type=%s)", req.MainSubmission.ID, req.MainSubmission.SubmissionType)
		err = rSubmission.CreateUserSubmissionInDatabase()
		if err != nil {
			utils.ReturnErrorMessage(c, http.StatusInternalServerError, "error occurred while creating related user submission", err)
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"mainSubmission":     req.MainSubmission,
		"relatedSubmissions": req.RelatedSubmissions,
	})
}

func ApproveUserSubmission(c *gin.Context) {
	type ApproveUserSubmissionRequest struct {
		SubmissionID int64 `json:"submissionId"`
	}
	// Post form data
	var req ApproveUserSubmissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	// Get user submission
	userSubmission, err := models.GetUserSubmissionByID(req.SubmissionID, true, true)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusNotFound, "user submission not found", err)
		return
	}
	// If this submission is already approved, we do not reapprove it
	if userSubmission.Validated {
		errMsg := fmt.Sprintf("Submission of id %d has already been validated", userSubmission.RelatedTo.ID)
		utils.ReturnErrorMessage(c, http.StatusConflict, errMsg, fmt.Errorf(errMsg))
		return
	}
	// If their is a related submission and that it is not validated, this submission cannot be approved
	if userSubmission.RelatedTo != nil && !userSubmission.RelatedTo.Validated {
		errMsg := fmt.Sprintf("Submission of id %d's related submission (id=%d) isn't validated yet", userSubmission.ID, userSubmission.RelatedTo.ID)
		utils.ReturnErrorMessage(c, http.StatusConflict, errMsg, fmt.Errorf(errMsg))
		return
	}
	// Approve user submission
	item, err := userSubmission.Approve()
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"approvedItem": item,
	})
}

func GetUserSubmissionsByUserID(c *gin.Context) {
	type UserSubmissionsByUserIDRequest struct {
		UserID      int64 `form:"userId"`
		WithUser    bool  `form:"withUser"`
		WithRelated bool  `form:"withRelated"`
	}
	// GET form data
	var req UserSubmissionsByUserIDRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.ReturnErrorMessage(c, http.StatusBadRequest, "invalid request", err)
		return
	}
	userSubmissions, err := models.GetUserSubmissionsByUserID(req.UserID, req.WithUser, req.WithRelated)
	if err != nil {
		utils.ReturnErrorMessage(c, http.StatusInternalServerError, "internal error", err)
		return
	}
	c.JSON(http.StatusOK, userSubmissions)
}
