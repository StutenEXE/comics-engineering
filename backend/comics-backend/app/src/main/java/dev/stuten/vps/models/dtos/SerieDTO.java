package dev.stuten.vps.models.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SerieDTO(
        @JsonProperty("id") Integer id,
        @JsonProperty("name") String name,
        @JsonProperty("ongoing") Boolean ongoing,
        @JsonProperty("oneshot") Boolean oneshot,
        @JsonProperty("nvolumes") Integer nvolumes,
        @JsonProperty("voStart") String voStart,
        @JsonProperty("voEnd") String voEnd,
        @JsonProperty("books") List<BookDTO> books,
        @JsonProperty("createdAt") String createdAt,
        @JsonProperty("modifiedAt") String modifiedAt,
        @JsonProperty("addedBy") UserDTO addedBy) {
}
