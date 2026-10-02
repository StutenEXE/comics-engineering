package dev.stuten.vps.models.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateUserDTO (
    @JsonProperty("username") String username,
    @JsonProperty("email") String email,
    // Required to authorize any modification
    @JsonProperty("currentPassword") String currentPassword,
    // Optional, password is unchanged if null or blank
    @JsonProperty("newPassword") String newPassword
) { }
