package dev.stuten.vps.models.dtos;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.OffsetTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.OffsetDateTimeSerializer;

public record UserSubmissionDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("addedBy") UserDTO addedBy,
        @JsonProperty("relatedTo") UserSubmissionDTO relatedTo,
        @JsonProperty("submissionType") UserSubmissionType submissionType,
        @JsonProperty("submissionAction") UserSubmissionAction submissionAction,
        @JsonProperty("submissionData") String submissionData,
        @JsonProperty("note") String note,
        @JsonProperty("validated") Boolean validated,

        @JsonProperty("createdAt") @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") @JsonSerialize(using = OffsetDateTimeSerializer.class) @JsonDeserialize(using = OffsetTimeDeserializer.class) OffsetDateTime createdAt) {

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
