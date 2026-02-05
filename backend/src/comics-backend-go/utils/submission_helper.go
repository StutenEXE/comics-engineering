package utils

import (
	"encoding/json"
)

func ParseSubmissionDataToStruct[T any](data string) (*T, error) {
	var t T
	err := json.Unmarshal([]byte(data), &t)
	if err != nil {
		return nil, err
	}
	return &t, nil
}
