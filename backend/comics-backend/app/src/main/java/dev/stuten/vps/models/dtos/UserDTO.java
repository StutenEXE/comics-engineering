package dev.stuten.vps.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;


public record UserDTO (
    @JsonProperty("id") Integer id,
    @JsonProperty("username") String username,
    @JsonProperty("email") String email, 
    @JsonProperty("isAdmin") Boolean isAdmin, 
    @JsonProperty("createdAt") String createdAt,
    @JsonProperty("modifiedAt") String modifiedAt
) {}
