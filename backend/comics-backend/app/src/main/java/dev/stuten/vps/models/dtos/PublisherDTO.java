package dev.stuten.vps.models.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PublisherDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("editions") List<EditionDTO> editions,
        @JsonProperty("createdAt") String createdAt,
        @JsonProperty("modifiedAt") String modifiedAt) {
}
