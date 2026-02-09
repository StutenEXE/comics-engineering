package dev.stuten.vps.models.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IssueSerieDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("desc") String desc,
        @JsonProperty("voStart") String voStart,
        @JsonProperty("voEnd") String voEnd,
        @JsonProperty("issues") List<IssueDTO> issues,
        @JsonProperty("createdAt") String createdAt,
        @JsonProperty("modifiedAt") String modifiedAt,
        @JsonProperty("addedBy") UserDTO addedBy) {
}
