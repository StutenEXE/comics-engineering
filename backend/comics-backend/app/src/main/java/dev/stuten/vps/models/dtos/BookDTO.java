package dev.stuten.vps.models.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record BookDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("desc") String desc,
        @JsonProperty("number") Integer number,
        @JsonProperty("voContent") String voContent,
        @JsonProperty("serie") SerieDTO serie,
        @JsonProperty("editions") List<EditionDTO> editions,
        @JsonProperty("issues") List<IssueDTO> issues,
        @JsonProperty("createdAt") String createdAt,
        @JsonProperty("modifiedAt") String modifiedAt,
        @JsonProperty("addedBy") UserDTO addedBy) {
}
