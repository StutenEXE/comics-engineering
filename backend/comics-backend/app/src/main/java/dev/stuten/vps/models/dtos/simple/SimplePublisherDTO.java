package dev.stuten.vps.models.dtos.simple;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SimplePublisherDTO(
                @JsonProperty("id") Integer id,
                @JsonProperty("name") String name) {
}
