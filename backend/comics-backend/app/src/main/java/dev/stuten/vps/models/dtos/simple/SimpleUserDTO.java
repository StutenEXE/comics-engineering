package dev.stuten.vps.models.dtos.simple;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SimpleUserDTO(
                @JsonProperty("id") Integer id,
                @JsonProperty("username") String username) {
}
