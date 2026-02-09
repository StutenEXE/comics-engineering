package dev.stuten.vps.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserSubmissionDTO(
    @JsonProperty("id") Integer id,
    @JsonProperty("addedBy") UserDTO addedBy,
    @JsonProperty("relatedTo") UserSubmissionDTO relatedTo,
    @JsonProperty("submissionType") UserSubmissionType submissionType,
    @JsonProperty("submissionAction") UserSubmissionAction submissionAction,
    @JsonProperty("submissionData") String submissionData,
    @JsonProperty("note") String note,
    @JsonProperty("validated") Boolean validated,
    @JsonProperty("createdAt") String createdAt
) {

    public enum UserSubmissionType {
        BOOK("book"),
        SERIE("serie"),
        EDITION("edition"),
        ISSUE("issue"),
        ISSUESERIE("issueserie"),
        PUBLISHER("publisher"),
        LINK_BOOK_ISSUE("link_book_issue");

        private final String value;

        UserSubmissionType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public enum UserSubmissionAction {
        CREATE("create"),
        UPDATE("update"),
        DELETE("delete");

        private final String value;

        UserSubmissionAction(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}


