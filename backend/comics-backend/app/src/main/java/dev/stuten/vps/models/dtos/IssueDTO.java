package dev.stuten.vps.models.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IssueDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("number") Integer number,
        @JsonProperty("coverDate") String coverDate,
        @JsonProperty("parutionDate") String parutionDate,
        @JsonProperty("isAnnual") Boolean isAnnual,
        @JsonProperty("hasBackup") Boolean hasBackup,
        @JsonProperty("backupName") String backupName,
        @JsonProperty("issueSerie") IssueSerieDTO issueSerie,
        @JsonProperty("books") List<BookDTO> books,
        @JsonProperty("createdAt") String createdAt,
        @JsonProperty("modifiedAt") String modifiedAt,
        @JsonProperty("addedBy") UserDTO addedBy) {
}
